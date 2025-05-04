/**
 * PDF Generation Utilities
 * 
 * This module provides functions for creating PDF documents with images and text
 * side by side for the OCR to PDF app.
 */

import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

// Import PDFKit types
import * as PDFKit from 'pdfkit';

/**
 * Initialize PDF generator with default settings
 * @returns A configured PDFDocument instance
 */
export function initPdfGenerator(): PDFKit.PDFDocument {
  // Create a new PDF document with A4 size in portrait orientation
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    font: undefined, // Don't set font during initialization
    info: {
      Title: 'OCR Results',
      Author: 'OCR to PDF Converter',
      Subject: 'Text extracted from images',
      Keywords: 'OCR, text recognition, image to text',
      Creator: 'OCR to PDF Converter',
      Producer: 'OCR to PDF Converter (PDFKit)',
    }
  });
  
  return doc;
}

/**
 * Generate a simple test PDF to verify the PDF generation system is working
 * @returns Buffer containing the PDF data
 */
export async function generateTestPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Initialize PDF generator
      const doc = initPdfGenerator();
      
      // Create a buffer to collect PDF data
      const chunks: Buffer[] = [];
      
      // Handle document events
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Add content to the PDF
      doc.fontSize(24).text('PDF Generation Test', {
        align: 'center'
      });
      
      doc.moveDown();
      doc.fontSize(12).text('Hello World! This is a test PDF document.', {
        align: 'left'
      });
      
      doc.moveDown();
      doc.fontSize(10).text('If you can read this, the PDF generation library is working correctly.', {
        align: 'left'
      });
      
      // Add the current date and time
      doc.moveDown();
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'left'
      });
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create a single PDF page with an image on the left side and text on the right side
 * @param doc PDFDocument to add the page to
 * @param imageBuffer Buffer containing the image data
 * @param extractedText The text extracted from the image via OCR
 * @param imageMimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg')
 * @param isNewPage Whether to create a new page (set to false for the first page)
 */
export function createImageTextPage(
  doc: PDFKit.PDFDocument,
  imageBuffer: Buffer,
  extractedText: string,
  imageMimeType: string,
  isNewPage: boolean = true
): void {
  // Create a new page if requested (except for the first page)
  if (isNewPage) {
    doc.addPage();
  }

  // Get page dimensions (A4)
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
  
  // Calculate dimensions
  const imageWidth = pageWidth * 0.45; // 45% of available width for image
  const textWidth = pageWidth * 0.5; // 50% of available width for text
  const textX = doc.page.margins.left + imageWidth + (pageWidth * 0.05); // 5% spacing
  
  // Add the image to the left side, maintaining aspect ratio
  try {
    // Use the fit option to properly scale the image within the allocated space
    doc.image(imageBuffer, doc.page.margins.left, doc.page.margins.top, {
      fit: [imageWidth, pageHeight],
      align: 'center',
      valign: 'center'
    });
  } catch (error) {
    // If image fails to load, add placeholder text
    doc.fontSize(12).text('[ Image could not be displayed ]', 
      doc.page.margins.left, 
      doc.page.margins.top + 100, 
      { width: imageWidth }
    );
    console.error('Error adding image to PDF:', error);
  }
  
  // Add a vertical divider line
  const dividerX = doc.page.margins.left + imageWidth + (pageWidth * 0.025); // Middle of the spacing
  doc.moveTo(dividerX, doc.page.margins.top)
     .lineTo(dividerX, doc.page.margins.top + pageHeight)
     .stroke();
  
  // Set default font manually since we initialized with font: null
  doc.font('Courier').fontSize(11);
  
  // Create a title for the text section
  doc.fontSize(14)
     .text('Extracted Text:', textX, doc.page.margins.top);
  
  // Add some space after the title
  doc.moveDown(0.5);
  
  // Reset to normal font for the content
  doc.fontSize(11);
  
  // Set text position and add the extracted text with proper wrapping
  doc.text(extractedText || 'No text could be extracted from this image.', {
    width: textWidth,
    align: 'left',
    columns: 1,
  });
} 