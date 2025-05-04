import { NextResponse } from "next/server";
import { createMultiPagePdf } from "@/lib/pdf/jspdf";
import { handlePdfError, PdfErrorType, PdfGenerationError } from "@/lib/pdf/error";
import { logger } from "@/lib/utils/logger";
import { cleanupLeftoverTempFiles } from '@/lib/utils/server';

interface OcrResult {
  fileName: string;
  text?: string;
  error?: string;
  success: boolean;
  imageUrl?: string;
}

interface PdfGenerationRequest {
  ocrResults: OcrResult[];
}

export async function POST(request: Request) {
  logger.jobStart('PDF Generation', { endpoint: '/api/pdf/generate' });
  
  try {
    // Parse JSON data from the request
    const requestData = await request.json() as PdfGenerationRequest;
    const { ocrResults } = requestData;

    logger.info('Received OCR results for PDF generation', { 
      resultCount: ocrResults.length,
      resultSummary: ocrResults.map(r => ({
        fileName: r.fileName,
        success: r.success,
        hasImage: Boolean(r.imageUrl && r.imageUrl.length > 0)
      }))
    });

    if (!ocrResults || !Array.isArray(ocrResults) || ocrResults.length === 0) {
      logger.warn('No OCR results provided for PDF generation');
      return NextResponse.json(
        { error: "No OCR results provided for PDF generation" },
        { status: 400 }
      );
    }

    // Filter only successful OCR results
    const successfulResults = ocrResults.filter((result: OcrResult) => 
      result.success && result.text && result.fileName
    );

    logger.info('PDF generation preparation', {
      totalResults: ocrResults.length,
      successfulResults: successfulResults.length,
      resultsWithImages: successfulResults.filter(r => r.imageUrl && r.imageUrl.length > 0).length
    });

    if (successfulResults.length === 0) {
      logger.warn('No successful OCR results found for PDF generation');
      return NextResponse.json(
        { error: "No successful OCR results found for PDF generation" },
        { status: 400 }
      );
    }

    // Prepare image-text pairs for PDF generation
    const imageTextPairs = successfulResults.map((result: OcrResult) => {
      // Ensure we have a valid data URL for the image
      let imageUrl = '';
      
      if (result.imageUrl && result.imageUrl.length > 0) {
        if (result.imageUrl.startsWith('data:')) {
          // Already a valid data URL
          imageUrl = result.imageUrl;
          logger.debug(`Valid image data URL found for ${result.fileName}`);
        } else {
          // Unknown format, log and continue
          logger.warn(`Unknown image URL format for ${result.fileName}`, {
            urlPreview: result.imageUrl.substring(0, 20) + '...'
          });
          imageUrl = '';
        }
      } else {
        logger.warn(`No image data provided for ${result.fileName}`);
      }
      
      return {
        imageDataUrl: imageUrl,
        extractedText: result.text || "",
        filename: result.fileName
      };
    });

    logger.info('PDF generation starting', { 
      pairCount: imageTextPairs.length,
      hasValidImages: imageTextPairs.some(pair => pair.imageDataUrl && pair.imageDataUrl.length > 0)
    });

    // Generate PDF
    const pdfBuffer = await createMultiPagePdf(imageTextPairs);

    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
    const filename = `ocr_results_${timestamp}.pdf`;
    
    logger.pdfGeneration(true, {
      imageCount: imageTextPairs.length,
      message: `PDF successfully generated with ${imageTextPairs.length} pages`
    });
    
    // Clean up any leftover temporary files from the OCR process
    try {
      await cleanupLeftoverTempFiles();
      logger.debug('Successfully cleaned up any leftover temporary files after PDF generation');
    } catch (cleanupError) {
      logger.warn('Non-critical error during post-PDF leftover cleanup', {
        error: (cleanupError as Error).message
      });
    }
    
    logger.jobEnd('PDF Generation', {
      successCount: imageTextPairs.length,
      failureCount: 0,
      pdfSize: pdfBuffer.length
    });

    // Return the PDF file with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      }
    });
    
  } catch (error: any) {
    logger.error('Error generating PDF', {
      error: error.message || 'Unknown error',
      stack: error.stack
    });
    
    // Use the PDF error handler to get a standardized error
    const pdfError = handlePdfError(error);
    
    logger.pdfGeneration(false, {
      error: pdfError,
      message: pdfError.message || 'Unknown PDF generation error'
    });
    
    // Even in case of error, try to clean up any leftover temporary files
    try {
      await cleanupLeftoverTempFiles();
      logger.debug('Successfully cleaned up any leftover temporary files after PDF generation error');
    } catch (cleanupError) {
      logger.warn('Non-critical error during post-PDF-error leftover cleanup', {
        error: (cleanupError as Error).message
      });
    }
    
    logger.jobEnd('PDF Generation', {
      successCount: 0,
      failureCount: 1,
      errorType: pdfError.type,
      errorMessage: pdfError.message
    });
    
    return NextResponse.json(
      { 
        error: pdfError.message || "An unexpected error occurred while generating PDF",
        errorType: pdfError.type || PdfErrorType.UNKNOWN_ERROR
      },
      { status: 500 }
    );
  }
} 