import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a File to a Base64 data URL with optional optimization
 * @param file The file to convert
 * @param options Optional configuration for the optimization
 * @returns Promise with the data URL
 */
export function fileToBase64(
  file: File, 
  options: {
    maxDimension?: number;
    quality?: number;
    forceOptimize?: boolean;
  } = {}
): Promise<string> {
  const { 
    maxDimension = 1200, 
    quality = 0.8, 
    forceOptimize = false 
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // For preview-only usage, we might want to use a smaller dimension
      const img = new Image();
      img.onload = () => {
        // If image is large or we force optimization, resize it
        if (forceOptimize || img.width > maxDimension || img.height > maxDimension) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions while maintaining aspect ratio
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (img.width > img.height && img.width > maxDimension) {
            newHeight = Math.round(newHeight * (maxDimension / img.width));
            newWidth = maxDimension;
          } else if (img.height > maxDimension) {
            newWidth = Math.round(img.width * (maxDimension / img.height));
            newHeight = maxDimension;
          }
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to data URL with specified quality
          const optimizedDataUrl = canvas.toDataURL(file.type, quality);
          resolve(optimizedDataUrl);
        } else {
          // If image is already small, use the original
          resolve(reader.result as string);
        }
      };
      img.onerror = () => {
        // If image loading fails, return the original data URL
        resolve(reader.result as string);
      };
      img.src = reader.result as string;
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Create an optimized preview URL for an image file
 * Specialized version of fileToBase64 for thumbnails/previews
 * @param file The file to create a preview for
 * @returns Promise with the preview URL (object URL or data URL)
 */
export function createOptimizedPreview(file: File): Promise<string> {
  // For very large files, use data URL with optimization
  if (file.size > 5 * 1024 * 1024) { // 5MB threshold
    return fileToBase64(file, { maxDimension: 800, quality: 0.7 });
  } else {
    // For smaller files, use object URL
    return Promise.resolve(URL.createObjectURL(file));
  }
}

/**
 * Extract the filename from a file path
 * @param path The full file path or name
 * @returns The extracted filename
 */
export function extractFilename(path: string): string {
  return path.split(/[\/\\]/).pop() || path;
}

/**
 * Analyzes a file's MIME type by reading its magic numbers
 * @param file The file to analyze
 * @returns Promise resolving to boolean indicating if file is a supported image
 */
export async function analyzeMimeType(file: File): Promise<boolean> {
  try {
    // Read the first few bytes of the file to check headers
    const headerBytes = await file.slice(0, 12).arrayBuffer();
    const headerView = new Uint8Array(headerBytes);
    
    // JPEG format
    if (headerView[0] === 0xFF && headerView[1] === 0xD8 && headerView[2] === 0xFF) {
      return true;
    } 
    // PNG format
    else if (
      headerView[0] === 0x89 && headerView[1] === 0x50 && 
      headerView[2] === 0x4E && headerView[3] === 0x47 &&
      headerView[4] === 0x0D && headerView[5] === 0x0A &&
      headerView[6] === 0x1A && headerView[7] === 0x0A
    ) {
      return true;
    } 
    // WebP format
    else if (
      headerView[0] === 0x52 && headerView[1] === 0x49 && 
      headerView[2] === 0x46 && headerView[3] === 0x46 &&
      headerView[8] === 0x57 && headerView[9] === 0x45 &&
      headerView[10] === 0x42 && headerView[11] === 0x50
    ) {
      return true;
    } 
    // HEIC/HEIF formats
    else if (
      (headerView[4] === 0x66 && headerView[5] === 0x74 && 
       headerView[6] === 0x79 && headerView[7] === 0x70) &&
      ((headerView[8] === 0x68 && headerView[9] === 0x65 && 
        headerView[10] === 0x69 && headerView[11] === 0x63) ||
       (headerView[8] === 0x68 && headerView[9] === 0x65 && 
        headerView[10] === 0x69 && headerView[11] === 0x66) ||
       (headerView[8] === 0x6D && headerView[9] === 0x69 && 
        headerView[10] === 0x66 && headerView[11] === 0x31))
    ) {
      return true;
    } 
    // Unsupported format
    else {
      return false;
    }
  } catch (error) {
    console.error(`Error analyzing MIME type for ${file.name}:`, error);
    return false;
  }
}

/**
 * Determines image format from a data URL
 * @param dataUrl The data URL to analyze
 * @returns The detected image format (JPEG, PNG, etc.)
 */
export function getImageFormatFromDataUrl(dataUrl: string): string {
  if (!dataUrl) return 'JPEG'; // Default format
  
  if (dataUrl.includes('data:image/png')) {
    return 'PNG';
  } else if (dataUrl.includes('data:image/webp')) {
    return 'WEBP';
  } else if (dataUrl.includes('data:image/jpeg') || dataUrl.includes('data:image/jpg')) {
    return 'JPEG';
  }
  
  return 'JPEG'; // Default to JPEG if no match
}

/**
 * Validates if a file has a supported image extension
 * @param fileName The filename to check
 * @returns Boolean indicating if the file has a valid extension
 */
export function hasValidImageExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return (
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".webp") ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif")
  );
}

/**
 * Safely revokes object URLs to prevent memory leaks
 * @param urls Array of URLs to revoke
 */
export function revokeObjectUrls(urls: string[]): void {
  urls.forEach(url => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error revoking object URL:', error);
      }
    }
  });
}

/**
 * Cleanup image files by revoking their preview URLs
 * @param imageFiles Array of image files with preview URLs
 */
export function cleanupImageFiles<T extends { preview: string }>(imageFiles: T[]): void {
  const urls = imageFiles.map(file => file.preview).filter(Boolean);
  revokeObjectUrls(urls);
} 