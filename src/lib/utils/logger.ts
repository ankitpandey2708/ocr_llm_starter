/**
 * Server-side logging utility for the OCR to PDF application
 * This module provides standardized logging functionality across the application
 */

// Define log level types
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define log entry structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Format a log entry as a string
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

/**
 * Create a log entry object
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  };
}

/**
 * Write a log entry to the configured output
 */
function writeLog(entry: LogEntry): void {
  const formattedEntry = formatLogEntry(entry);
  
  // In a production environment, this could be replaced with a more
  // sophisticated logging service like Winston, Pino, or a cloud logging service
  switch (entry.level) {
    case 'debug':
      console.debug(formattedEntry);
      break;
    case 'info':
      console.info(formattedEntry);
      break;
    case 'warn':
      console.warn(formattedEntry);
      break;
    case 'error':
      console.error(formattedEntry);
      break;
  }
}

// Public logging API
export const logger = {
  /**
   * Log a debug message
   */
  debug: (message: string, context?: Record<string, unknown>) => {
    writeLog(createLogEntry('debug', message, context));
  },
  
  /**
   * Log an info message
   */
  info: (message: string, context?: Record<string, unknown>) => {
    writeLog(createLogEntry('info', message, context));
  },
  
  /**
   * Log a warning message
   */
  warn: (message: string, context?: Record<string, unknown>) => {
    writeLog(createLogEntry('warn', message, context));
  },
  
  /**
   * Log an error message
   */
  error: (message: string, context?: Record<string, unknown>) => {
    writeLog(createLogEntry('error', message, context));
  },
  
  /**
   * Log the start of a job
   */
  jobStart: (jobType: string, context?: Record<string, unknown>) => {
    writeLog(createLogEntry('info', `Job started: ${jobType}`, context));
  },
  
  /**
   * Log the end of a job
   */
  jobEnd: (
    jobType: string, 
    {
      successCount = 0, 
      failureCount = 0,
      ...additionalContext
    }: {
      successCount?: number;
      failureCount?: number;
      [key: string]: unknown;
    } = {}
  ) => {
    writeLog(createLogEntry('info', `Job completed: ${jobType}`, {
      successCount,
      failureCount,
      ...additionalContext
    }));
  },
  
  /**
   * Log a Gemini API error
   */
  geminiApiError: (error: Error | unknown, fileName?: string) => {
    writeLog(createLogEntry('error', 'Gemini API error', {
      message: error instanceof Error ? error.message : 'Unknown error',
      fileName,
      stack: error instanceof Error ? error.stack : undefined
    }));
  },
  
  /**
   * Log PDF generation result
   */
  pdfGeneration: (
    success: boolean, 
    {
      imageCount = 0,
      message = '',
      error = null
    }: {
      imageCount?: number;
      message?: string;
      error?: Error | null | unknown;
    } = {}
  ) => {
    if (success) {
      writeLog(createLogEntry('info', 'PDF generation successful', {
        imageCount,
        message
      }));
    } else {
      writeLog(createLogEntry('error', 'PDF generation failed', {
        imageCount,
        message,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      }));
    }
  },

  /**
   * Log temporary file creation
   */
  tempFileCreated: (
    filePath: string,
    fileName: string,
    fileSize?: number
  ) => {
    writeLog(createLogEntry('debug', `Temporary file created: ${fileName}`, {
      filePath,
      fileName,
      fileSize,
      timestamp: new Date().toISOString()
    }));
  },

  /**
   * Log temporary file deletion
   */
  tempFileDeleted: (
    filePath: string,
    fileName: string,
    success: boolean,
    error?: Error | unknown
  ) => {
    if (success) {
      writeLog(createLogEntry('debug', `Temporary file deleted: ${fileName}`, {
        filePath,
        fileName,
        timestamp: new Date().toISOString()
      }));
    } else {
      writeLog(createLogEntry('warn', `Failed to delete temporary file: ${fileName}`, {
        filePath,
        fileName,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }));
    }
  },

  /**
   * Log temporary file verification
   */
  tempFileVerification: (
    success: boolean,
    totalChecked: number,
    remainingFiles: number
  ) => {
    if (success) {
      writeLog(createLogEntry('info', `Verified all temporary files deleted`, {
        totalChecked,
        remainingFiles,
        timestamp: new Date().toISOString()
      }));
    } else {
      writeLog(createLogEntry('warn', `Temporary file verification failed`, {
        totalChecked,
        remainingFiles,
        timestamp: new Date().toISOString()
      }));
    }
  }
}; 