/**
 * PDF Generation using jsPDF
 * 
 * This module provides functions for creating PDF documents with images and text
 * side by side for the OCR to PDF app using jsPDF library which is better suited
 * for Next.js API routes.
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { handlePdfError, PdfErrorType, PdfGenerationError } from './error';
import { logger } from '../utils/logger';

/**
 * Create a new PDF document
 * @returns A configured jsPDF instance
 */
export function createPdf(): jsPDF {
  logger.debug('Creating new PDF document');
  return new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
}

/**
 * Create a PDF with an image and text side by side
 * @param imageDataUrl The image as a data URL
 * @param extractedText The text extracted from the image
 * @returns Buffer containing the PDF data
 */
export async function createImageTextPdf(
  imageDataUrl: string,
  extractedText: string
): Promise<Buffer> {
  logger.debug('Creating single page image-text PDF');
  
  // Create PDF document
  const doc = createPdf();
  
  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  
  // Define margins in mm
  const margin = 20;
  
  // Calculate working area dimensions
  const workWidth = pageWidth - (margin * 2);
  const workHeight = pageHeight - (margin * 2);
  
  // Calculate image width (45% of working width)
  const imageWidth = workWidth * 0.45;
  const textX = margin + imageWidth + (workWidth * 0.05); // 5% spacing
  const textWidth = workWidth * 0.5;
  
  try {
    // Try a simpler approach to add the image
    // Use a placeholder rectangle in case image fails to load
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, margin, imageWidth, workHeight * 0.8, 'F');
    
    // Try to add the image if it's not an SVG
    if (!imageDataUrl.includes('svg')) {
      try {
        // Add image to the left side with basic parameters
        doc.addImage(
          imageDataUrl,
          'JPEG', // Format (JPEG, PNG, etc.)
          margin,
          margin,
          imageWidth,
          workHeight * 0.8
        );
        logger.debug('Successfully added image to PDF');
      } catch (imgError) {
        logger.warn('Could not add image to PDF', {
          error: (imgError as Error).message
        });
        
        // Add a placeholder text on error
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('[ Image could not be displayed ]', margin + 5, margin + 30);
        
        // Log the error but continue with PDF generation
        logger.error('Error adding image to PDF', {
          error: (imgError as Error).message,
          stack: (imgError as Error).stack
        });
      }
    } else {
      // SVG not directly supported, show placeholder text
      logger.warn('SVG image format not supported');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('[ SVG image not supported ]', margin + 5, margin + 30);
    }
    
    // Add a divider line
    const dividerX = margin + imageWidth + (workWidth * 0.025);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(dividerX, margin, dividerX, pageHeight - margin);
    
    // Set up text settings
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    
    // Add title
    doc.text('Extracted Text:', textX, margin + 5);
    
    // Add the actual text content
    doc.setFontSize(10);
    const textLines = doc.splitTextToSize(
      extractedText || 'No text could be extracted from this image.', 
      textWidth
    );
    doc.text(textLines, textX, margin + 12);
    
    logger.debug('PDF creation successful');
    
    // Convert the PDF to a Buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    // Handle PDF generation errors
    const pdfError = handlePdfError(error);
    logger.error('Error creating PDF', {
      error: pdfError.message,
      type: pdfError.type
    });
    throw pdfError;
  }
}

/**
 * Create a PDF with multiple images and their extracted texts
 * @param imageTextPairs Array of {imageDataUrl, extractedText} pairs
 * @returns Buffer containing the PDF data
 */
export async function createMultiPagePdf(
  imageTextPairs: Array<{imageDataUrl: string, extractedText: string, filename: string}>
): Promise<Buffer> {
  logger.info('Creating multi-page PDF', { pageCount: imageTextPairs.length });
  
  if (!imageTextPairs || imageTextPairs.length === 0) {
    logger.error('No images provided for PDF generation');
    throw new PdfGenerationError(
      'No images provided for PDF generation',
      PdfErrorType.PDF_GENERATION_ERROR
    );
  }
  
  // Create PDF document
  const doc = createPdf();
  
  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  
  // Define margins in mm
  const margin = 20;
  
  // Calculate working area dimensions
  const workWidth = pageWidth - (margin * 2);
  const workHeight = pageHeight - (margin * 2);
  
  // Calculate image width (45% of working width)
  const imageWidth = workWidth * 0.45;
  const textX = margin + imageWidth + (workWidth * 0.05); // 5% spacing
  const textWidth = workWidth * 0.5;
  
  try {
    // Create each page
    let imageErrors: string[] = [];
    
    imageTextPairs.forEach((pair, index) => {
      // Add a new page for all but the first item
      if (index > 0) {
        doc.addPage();
      }
      
      logger.debug(`Creating page ${index + 1} for ${pair.filename}`);
      
      // Check if we have a valid image URL
      if (pair.imageDataUrl && pair.imageDataUrl.trim() !== '') {
        try {
          logger.debug(`Processing image for ${pair.filename}`, {
            dataUrlPreview: pair.imageDataUrl.substring(0, 30) + '...'
          });
          
          // For data URLs, we need to extract the format
          let format = 'JPEG'; // Default format
          if (pair.imageDataUrl.includes('data:image/png')) {
            format = 'PNG';
          } else if (pair.imageDataUrl.includes('data:image/jpeg') || pair.imageDataUrl.includes('data:image/jpg')) {
            format = 'JPEG';
          }
          
          // Add image to the left side with basic parameters
          doc.addImage(
            pair.imageDataUrl,
            format,
            margin,
            margin,
            imageWidth,
            workHeight * 0.8
          );
          
          logger.debug(`Successfully added image for ${pair.filename}`);
        } catch (imgError) {
          // Add a placeholder text on error
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, margin, imageWidth, workHeight * 0.8, 'F');
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text('[ Image could not be displayed ]', margin + 5, margin + 30);
          
          // Record the error but continue with PDF generation
          imageErrors.push(`Failed to add image ${pair.filename}: ${(imgError as Error).message}`);
          logger.warn(`Could not add image to PDF for ${pair.filename}`, {
            error: (imgError as Error).message,
            errorType: 'IMAGE_PROCESSING'
          });
        }
      } else {
        // Empty URL, show placeholder text
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, margin, imageWidth, workHeight * 0.8, 'F');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('[ No image data available ]', margin + 5, margin + 30);
        
        logger.warn(`No image data for file: ${pair.filename}`);
      }
      
      // Add a divider line
      const dividerX = margin + imageWidth + (workWidth * 0.025);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(dividerX, margin, dividerX, pageHeight - margin);
      
      // Set up text settings
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      
      // Add title with filename
      doc.text(`Extracted Text from: ${pair.filename}`, textX, margin + 5);
      
      // Add the actual text content
      doc.setFontSize(10);
      const textLines = doc.splitTextToSize(
        pair.extractedText || 'No text could be extracted from this image.', 
        textWidth
      );
      doc.text(textLines, textX, margin + 12);
      
      logger.debug(`Completed page ${index + 1} for ${pair.filename}`);
    });
    
    // Add a summary page if there were any errors
    if (imageErrors.length > 0) {
      logger.info('Adding error summary page to PDF', { errorCount: imageErrors.length });
      
      doc.addPage();
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('PDF Generation Report', margin, margin + 10);
      
      doc.setFontSize(12);
      doc.text(
        `Successfully processed ${imageTextPairs.length - imageErrors.length} out of ${imageTextPairs.length} images.`, 
        margin, 
        margin + 20
      );
      
      if (imageErrors.length > 0) {
        doc.setTextColor(200, 0, 0);
        doc.text('The following errors occurred:', margin, margin + 30);
        
        let yPosition = margin + 40;
        doc.setFontSize(10);
        
        imageErrors.forEach((errorMessage, index) => {
          doc.text(`${index + 1}. ${errorMessage}`, margin, yPosition);
          yPosition += 5;
        });
      }
    }
    
    logger.info('PDF generation completed successfully', {
      totalPages: imageTextPairs.length + (imageErrors.length > 0 ? 1 : 0),
      errorCount: imageErrors.length
    });
    
    // Convert the PDF to a Buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    // Handle PDF generation errors
    const pdfError = handlePdfError(error);
    logger.error('Error generating multi-page PDF', {
      errorType: pdfError.type,
      errorMessage: pdfError.message,
      pageCount: imageTextPairs.length
    });
    throw pdfError;
  }
} 