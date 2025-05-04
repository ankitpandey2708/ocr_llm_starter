import { NextResponse } from "next/server";
import { initGeminiApi, cleanupTempFiles, cleanupLeftoverTempFiles, verifyTempFilesCleanup } from "@/lib/utils/server";
import { logger } from "@/lib/utils/logger";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import { createUserContent } from "@google/genai";

/**
 * Error types for the OCR API
 */
enum OcrErrorType {
  API_KEY_INVALID = "API_KEY_INVALID",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INVALID_IMAGE_FORMAT = "INVALID_IMAGE_FORMAT",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

/**
 * Result of processing an image
 */
interface OcrResult {
  fileName: string;
  text?: string;
  error?: string;
  success: boolean;
}

/**
 * Determine the type of error based on the error message
 */
function determineErrorType(error: Error | unknown): { type: OcrErrorType, message: string } {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  if (errorMessage.includes("API key")) {
    return { 
      type: OcrErrorType.API_KEY_INVALID, 
      message: "Invalid API key. Please check your Gemini API key configuration." 
    };
  }
  
  if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
    return { 
      type: OcrErrorType.RATE_LIMIT_EXCEEDED, 
      message: "API rate limit exceeded. Please try again later." 
    };
  }
  
  if (errorMessage.includes("format") || errorMessage.includes("image")) {
    return { 
      type: OcrErrorType.INVALID_IMAGE_FORMAT, 
      message: "The provided image format is not supported by the API." 
    };
  }
  
  return { 
    type: OcrErrorType.UNKNOWN_ERROR, 
    message: `An unexpected error occurred: ${errorMessage}` 
  };
}

/**
 * Check if an error is critical and should stop processing of further images
 */
function isCriticalError(error: Error): boolean {
  const message = error.message || '';
  return (
    message.includes("API key") || 
    message.includes("rate limit") ||
    message.includes("quota")
  );
}

/**
 * Process a single image file with the Gemini API to extract text
 */
async function processImageWithGeminiApi(file: File): Promise<string> {
  // Create a unique temp file path with just the filename, not the full path
  // Get only the file name without any path components
  const fileName = file.name.split(/[\/\\]/).pop() || file.name;
  const tempFilePath = join(tmpdir(), `${uuidv4()}-${fileName}`);
  
  try {
    // Save file to temp directory
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, buffer);
    
    // Log temp file creation for tracking purposes
    logger.tempFileCreated(tempFilePath, fileName, buffer.length);
    logger.debug(`Processing image ${fileName}`, { size: buffer.length });

    // Initialize Gemini API
    const genAI = initGeminiApi();
    
    // Create file data with the uploaded image
    const fileData = {
      data: buffer.toString('base64'),
      mimeType: file.type
    };
    
    // Create model and generate content with the exact prompt as specified
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        {
          inlineData: fileData
        },
        "Please extract and provide the text content from the image."
      ])
    });

    logger.debug(`Successfully extracted text from ${fileName}`, {
      textLength: response.text?.length || 0
    });

    // Extract the text from the response
    return response.text || "";
  } catch (error) {
    logger.geminiApiError(error, fileName);
    
    // Determine the error type
    const errorDetails = determineErrorType(error);
    
    // Log specific API error with structured context
    logger.error(`Gemini API error processing ${fileName}`, {
      errorType: errorDetails.type,
      errorMessage: errorDetails.message
    });
    
    // Throw a more informative error
    throw new Error(`${errorDetails.type} : ${errorDetails.message}`);
  } finally {
    // Always clean up temp files
    try {
      await cleanupTempFiles([tempFilePath]);
      // Log successful cleanup
      logger.tempFileDeleted(tempFilePath, fileName, true);
    } catch (error) {
      // Log failed cleanup
      logger.tempFileDeleted(tempFilePath, fileName, false, error);
    }
  }
}

/**
 * Process multiple images sequentially and return results
 */
async function processImagesSequentially(files: File[]): Promise<OcrResult[]> {
  const results: OcrResult[] = [];
  const tempFilePaths: string[] = [];  // Track all temp files for verification later
  
  try {
    for (const file of files) {
      try {
        const text = await processImageWithGeminiApi(file);
        results.push({
          fileName: file.name,
          text,
          success: true
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({
          fileName: file.name,
          error: errorMessage,
          success: false
        });
        
        // Check if this is a critical error that should stop processing
        if (error instanceof Error && isCriticalError(error)) {
          logger.warn(`Stopping OCR processing batch due to critical error: ${errorMessage}`);
          break;
        }
        
        // In MVP, we stop processing after first API error
        logger.warn(`Stopping OCR processing batch after error in file ${file.name}`);
        break;
      }
    }
    
    // Verify all temp files were cleaned up
    const verificationResult = await verifyTempFilesCleanup(tempFilePaths);
    logger.tempFileVerification(verificationResult, tempFilePaths.length, tempFilePaths.length - (verificationResult ? tempFilePaths.length : 0));
    
    // As an extra precaution, scan for and clean up any leftover files
    await cleanupLeftoverTempFiles();
    
    return results;
  } catch (error) {
    logger.error(`Unexpected error in OCR batch processing`, {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    
    // Even in case of unexpected errors, try to clean up temp files
    try {
      await cleanupLeftoverTempFiles();
    } catch (cleanupError) {
      logger.error('Failed to clean up leftover temporary files', {
        error: (cleanupError as Error).message
      });
    }
    
    throw error;
  }
}

// 50MB is the maximum content length allowed by Next.js by default
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export async function POST(request: Request) {
  logger.jobStart('OCR', { endpoint: '/api/ocr' });
  
  try {
    // Check content type - must be multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      logger.warn("Invalid content type in request", { contentType });
      return NextResponse.json(
        { error: "Request must use multipart/form-data" },
        { status: 400 }
      );
    }

    // Get form data with images
    const formData = await request.formData();
    const files = formData.getAll('files');

    // Check if any files were uploaded
    if (!files || files.length === 0) {
      logger.warn("No image files were uploaded");
      return NextResponse.json(
        { error: "No image files were uploaded" },
        { status: 400 }
      );
    }

    logger.info(`Received ${files.length} files for OCR processing`);

    // Ensure all files are valid
    const validFiles: File[] = [];
    const invalidFiles: OcrResult[] = [];

    for (const file of files) {
      if (!file || !(file instanceof File)) {
        logger.warn("Invalid file received", { file: typeof file });
        invalidFiles.push({
          fileName: "unknown",
          error: "Invalid file",
          success: false
        });
      } else {
        validFiles.push(file);
      }
    }

    logger.info(`Valid files: ${validFiles.length}, Invalid files: ${invalidFiles.length}`);

    // Process valid files sequentially
    const processedResults = await processImagesSequentially(validFiles);
    const results = [...invalidFiles, ...processedResults];

    // Calculate stats for logging
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    logger.jobEnd('OCR', {
      successCount,
      failureCount,
      totalProcessed: results.length
    });

    // Return the extracted text from all images
    return NextResponse.json({ 
      results,
      summary: {
        totalProcessed: results.length,
        successCount,
        failureCount
      }
    });
  } catch (error: Error | unknown) {
    logger.error("OCR API error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    logger.jobEnd('OCR', {
      successCount: 0,
      failureCount: 1,
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 