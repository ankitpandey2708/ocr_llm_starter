/**
 * Server-side utilities for the OCR to PDF app
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { logger } from './logger';

/**
 * Get the Gemini API key from secure environment variables
 * This function should only be called on the server-side
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    logger.error('GEMINI_API_KEY environment variable not set');
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  if (apiKey.trim() === '') {
    logger.error('GEMINI_API_KEY environment variable is empty');
    throw new Error('GEMINI_API_KEY environment variable is empty');
  }
  
  return apiKey;
}

/**
 * Initialize the Gemini API client with the API key
 * This function should only be called on the server-side
 */
export function initGeminiApi(): GoogleGenAI {
  try {
    const apiKey = getGeminiApiKey();
    logger.debug('Initializing Gemini API client');
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    logger.error('Failed to initialize Gemini API', {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    throw error;
  }
}

/**
 * Clean up temporary files
 * @param filePaths Array of file paths to delete
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  logger.debug(`Cleaning up ${filePaths.length} temporary files`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.debug(`Successfully deleted temp file: ${filePath}`);
        successCount++;
      } else {
        logger.debug(`Temp file does not exist, skipping: ${filePath}`);
      }
    } catch (error) {
      logger.error(`Failed to delete temp file ${filePath}`, {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      failureCount++;
    }
  }
  
  logger.info('Temp file cleanup complete', {
    totalFiles: filePaths.length,
    deletedFiles: successCount,
    failedToDelete: failureCount
  });
}

/**
 * Scan temporary directory for any leftover files matching our application's patterns
 * @returns Array of paths to leftover temporary files
 */
export async function scanForLeftoverTempFiles(): Promise<string[]> {
  const tmpDir = tmpdir();
  logger.debug(`Scanning for leftover temporary files in ${tmpDir}`);
  
  try {
    const files = await fs.promises.readdir(tmpDir);
    
    // Filter for files that match our application's UUID pattern
    // We're looking for files created by our application in processImageWithGeminiApi
    // which use UUID v4 followed by a dash and the original filename
    const leftoverFiles = files.filter(file => {
      // Match UUID v4 pattern followed by dash (e.g., "123e4567-e89b-12d3-a456-426614174000-")
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-/i;
      return uuidPattern.test(file);
    });
    
    logger.info(`Found ${leftoverFiles.length} potential leftover temporary files`, {
      count: leftoverFiles.length
    });
    
    return leftoverFiles.map(file => join(tmpDir, file));
  } catch (error) {
    logger.error(`Error scanning for leftover temporary files`, {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    return [];
  }
}

/**
 * Clean up any leftover temporary files from the system temp directory
 * @returns Number of files successfully cleaned up
 */
export async function cleanupLeftoverTempFiles(): Promise<number> {
  const leftoverFiles = await scanForLeftoverTempFiles();
  
  if (leftoverFiles.length === 0) {
    logger.debug('No leftover temporary files found');
    return 0;
  }
  
  await cleanupTempFiles(leftoverFiles);
  
  // Count the files that were successfully deleted
  const remainingFiles = await scanForLeftoverTempFiles();
  const deletedCount = leftoverFiles.length - remainingFiles.length;
  
  logger.info(`Cleaned up ${deletedCount} leftover temporary files`, {
    initialCount: leftoverFiles.length,
    remainingCount: remainingFiles.length
  });
  
  return deletedCount;
}

/**
 * Verify that temporary files have been cleaned up
 * @param tempFilePaths Array of known temp file paths that should be deleted
 * @returns Boolean indicating whether all specified temp files are gone
 */
export async function verifyTempFilesCleanup(tempFilePaths: string[]): Promise<boolean> {
  logger.debug(`Verifying cleanup of ${tempFilePaths.length} temporary files`);
  
  let allDeleted = true;
  const remainingFiles: string[] = [];
  
  for (const filePath of tempFilePaths) {
    if (fs.existsSync(filePath)) {
      allDeleted = false;
      remainingFiles.push(filePath);
    }
  }
  
  if (!allDeleted) {
    logger.warn(`Found ${remainingFiles.length} temporary files that still exist`, {
      remainingFiles
    });
  } else {
    logger.debug('Verification successful: all specified temporary files have been deleted');
  }
  
  return allDeleted;
} 