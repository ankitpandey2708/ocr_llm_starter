/**
 * PDF Generation Error Handling
 * 
 * This module provides utilities for handling PDF generation errors in a consistent way.
 */

import { logger } from "@/lib/utils/logger";

/**
 * PDF Generation Error Types
 */
export enum PdfErrorType {
  // Image-related errors
  IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR',
  IMAGE_FORMAT_ERROR = 'IMAGE_FORMAT_ERROR',
  
  // PDF library errors
  PDF_GENERATION_ERROR = 'PDF_GENERATION_ERROR',
  
  // System errors
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  
  // Other/unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * PDF Generation Error class
 */
export class PdfGenerationError extends Error {
  type: PdfErrorType;
  details?: Record<string, unknown>;
  
  constructor(
    message: string, 
    type: PdfErrorType = PdfErrorType.UNKNOWN_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PdfGenerationError';
    this.type = type;
    this.details = details;
    
    // Log the error creation
    logger.error(`PDF Generation Error: ${type}`, {
      message,
      details
    });
  }
}

/**
 * Determine the type of error that occurred during PDF generation
 * @param error The original error
 * @returns A categorized PDF generation error
 */
export function handlePdfError(error: unknown): PdfGenerationError {
  // If it's already a PdfGenerationError, return it
  if (error instanceof PdfGenerationError) {
    return error;
  }
  
  const err = error as Error;
  const message = err?.message || 'Unknown PDF generation error';
  
  logger.error('Handling PDF error', {
    originalMessage: message,
    stack: err?.stack
  });
  
  // Handle errors related to image loading/processing
  if (message.includes('addImage') || message.includes('image')) {
    if (message.includes('type') || message.includes('format')) {
      return new PdfGenerationError(
        'The image format is not supported for PDF generation',
        PdfErrorType.IMAGE_FORMAT_ERROR,
        { originalError: err }
      );
    }
    
    return new PdfGenerationError(
      'Failed to load or process image for PDF',
      PdfErrorType.IMAGE_LOAD_ERROR,
      { originalError: err }
    );
  }
  
  // Handle file system errors
  if (message.includes('ENOENT') || message.includes('file')) {
    return new PdfGenerationError(
      'File system error during PDF generation',
      PdfErrorType.FILE_SYSTEM_ERROR,
      { originalError: err }
    );
  }
  
  // Default to general PDF generation error
  return new PdfGenerationError(
    'Error generating PDF document',
    PdfErrorType.PDF_GENERATION_ERROR,
    { originalError: err }
  );
}

/**
 * Get a user-friendly error message for display
 * @param error The PDF generation error
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: PdfGenerationError): string {
  const userMessage = (() => {
    switch (error.type) {
      case PdfErrorType.IMAGE_LOAD_ERROR:
        return 'Unable to load one or more images for the PDF. Please check the image files and try again.';
        
      case PdfErrorType.IMAGE_FORMAT_ERROR:
        return 'One or more images are in an unsupported format. Please use JPG or PNG images.';
        
      case PdfErrorType.FILE_SYSTEM_ERROR:
        return 'A file system error occurred while generating the PDF. Please try again later.';
        
      case PdfErrorType.PDF_GENERATION_ERROR:
        return 'An error occurred while creating the PDF document. Please try again later.';
        
      case PdfErrorType.UNKNOWN_ERROR:
      default:
        return 'An unexpected error occurred during PDF generation. Please try again later.';
    }
  })();
  
  // Log the user-friendly error that will be displayed
  logger.debug('Generating user-friendly error message', {
    errorType: error.type,
    originalMessage: error.message,
    userMessage
  });
  
  return userMessage;
} 