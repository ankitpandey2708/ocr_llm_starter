"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";

export interface ImageFile {
  file: File;
  preview: string;
}

// Helper function to analyze MIME types
const analyzeMimeType = async (file: File): Promise<boolean> => {
  try {
    // Read the first few bytes of the file to check headers
    const headerBytes = await file.slice(0, 12).arrayBuffer();
    const headerView = new Uint8Array(headerBytes);
    
    // Convert first bytes to hex for logging
    const headerHex = Array.from(headerView)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(' ');
    
    
    // Try to identify common image formats by magic numbers
    if (headerView[0] === 0xFF && headerView[1] === 0xD8 && headerView[2] === 0xFF) {
      console.log(`File: ${file.name} - Magic number indicates JPEG format`);
      return true;
    } else if (
      headerView[0] === 0x89 && headerView[1] === 0x50 && 
      headerView[2] === 0x4E && headerView[3] === 0x47 &&
      headerView[4] === 0x0D && headerView[5] === 0x0A &&
      headerView[6] === 0x1A && headerView[7] === 0x0A
    ) {
      console.log(`File: ${file.name} - Magic number indicates PNG format`);
      return true;
    } else if (
      headerView[0] === 0x52 && headerView[1] === 0x49 && 
      headerView[2] === 0x46 && headerView[3] === 0x46 &&
      headerView[8] === 0x57 && headerView[9] === 0x45 &&
      headerView[10] === 0x42 && headerView[11] === 0x50
    ) {
      console.log(`File: ${file.name} - Magic number indicates WebP format`);
      return true;
    } else if (
      (headerView[4] === 0x66 && headerView[5] === 0x74 && 
       headerView[6] === 0x79 && headerView[7] === 0x70) &&
      ((headerView[8] === 0x68 && headerView[9] === 0x65 && 
        headerView[10] === 0x69 && headerView[11] === 0x63) ||
       (headerView[8] === 0x68 && headerView[9] === 0x65 && 
        headerView[10] === 0x69 && headerView[11] === 0x66) ||
       (headerView[8] === 0x6D && headerView[9] === 0x69 && 
        headerView[10] === 0x66 && headerView[11] === 0x31))
    ) {
      console.log(`File: ${file.name} - Magic number indicates HEIC/HEIF format`);
      return true;
    } else {
      console.log(`File: ${file.name} - Magic number doesn't match supported image formats`);
      return false;
    }
  } catch (error) {
    console.error(`Error analyzing MIME type for ${file.name}:`, error);
    return false;
  }
};

interface FolderSelectorProps {
  onFolderSelect: (files: ImageFile[]) => void;
  reset?: boolean; // Flag to reset the component's state
  currentFiles?: ImageFile[]; // Optional prop to update count when files are removed externally
}

export function FolderSelector({ 
  onFolderSelect,
  reset = false,
  currentFiles
}: FolderSelectorProps) {
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [stats, setStats] = useState<{ total: number; supported: number }>({
    total: 0,
    supported: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when reset prop changes to true
  useEffect(() => {
    if (reset) {
      setHasSelection(false);
      setStats({
        total: 0,
        supported: 0,
      });
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [reset]);

  // Update stats when currentFiles prop changes (for image removal)
  useEffect(() => {
    if (currentFiles) {
      setHasSelection(currentFiles.length > 0);
      setStats({
        total: currentFiles.length,
        supported: currentFiles.length
      });
    }
  }, [currentFiles]);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isImageSupported = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const validExtension = (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".webp") ||
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif")
    );
    
    return validExtension;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // Log basic file information before processing
      Array.from(files).forEach((file, index) => {
        console.log(`File ${index + 1}/${files.length}: ${file.name}, Size: ${file.size} bytes, Type: ${file.type || 'unknown'}`);
      });
      
      // Track validation failures
      let extensionFailures = 0;
      let magicNumberFailures = 0;
      
      // Modified processFiles function to track different validation failures
      const processFilesWithErrorTracking = async (fileList: FileList): Promise<ImageFile[]> => {
        const result: ImageFile[] = [];
        let totalFiles = 0;
        
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          
          // Skip zero-byte files
          if (!file.size) {
            continue;
          }
          
          totalFiles++;
          
          const fileName = file.name.toLowerCase();
          const hasValidExtension = (
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg") ||
            fileName.endsWith(".png") ||
            fileName.endsWith(".webp") ||
            fileName.endsWith(".heic") ||
            fileName.endsWith(".heif")
          );
          
          if (!hasValidExtension) {
            console.warn(`Skipping file with invalid extension: ${file.name}`);
            extensionFailures++;
            continue; // Skip further processing for invalid extensions
          }
          
          // Only analyze magic number for files that passed extension check
          const hasValidMagicNumber = await analyzeMimeType(file);
          
          if (!hasValidMagicNumber) {
            console.warn(`Skipping file with invalid magic number: ${file.name}`);
            magicNumberFailures++;
            continue; // Skip further processing for invalid magic numbers
          }
          
          try {
            // Create URL for preview/thumbnail
            const preview = URL.createObjectURL(file);
            
            result.push({ 
              file, 
              preview
            });
          } catch (error) {
            console.error(`Error creating preview for ${file.name}:`, error);
          }
        }
        
        setStats({
          total: totalFiles,
          supported: result.length,
        });
        
        // Sort files by name for consistent order
        return result.sort((a, b) => a.file.name.localeCompare(b.file.name));
      };
      
      // Process the image files with error tracking
      const imageFiles = await processFilesWithErrorTracking(files);
      
      console.log(`After validation: ${imageFiles.length} of ${files.length} files were accepted`);
      
      if (imageFiles.length === 0) {
        // Show specific error messages based on the validation failure type
        if (extensionFailures > 0) {
          toast.error(`${extensionFailures} file(s) rejected: Unsupported image extension.`);
        } else if (magicNumberFailures > 0) {
          toast.error(`${magicNumberFailures} file(s) rejected: Image may be corrupted.`);
        } else {
          toast.error("No supported image files selected.");
        }
        setHasSelection(false);
      } else {
        // If we had some failures but also some successes, show warning
        if (extensionFailures > 0 || magicNumberFailures > 0) {
          const totalFailures = extensionFailures + magicNumberFailures;
          toast.warning(`${totalFailures} file(s) were skipped due to validation issues.`);
        }
        
        setHasSelection(true);
        onFolderSelect(imageFiles);
      }
    } catch (error) {
      console.error("Error processing selection:", error);
      
      setHasSelection(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
        multiple
        className="hidden"
        aria-label="Select images"
      />
      
      <div className="w-full max-w-md">
        <div className="group relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors duration-200 rounded-xl p-8 text-center">
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200"></div>
          
          <div className="relative space-y-4">
            <div className="mx-auto bg-slate-100 dark:bg-slate-800 rounded-full p-3 w-16 h-16 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors duration-200">
              <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-200">
                Select Images
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                JPG, PNG, WEBP, HEIC formats accepted
              </p>
            </div>
            
            <Button 
              onClick={handleButtonClick}
              className="flex items-center gap-2"
              size="default"
              variant="primary"
            >
              <Upload className="w-4 h-4" />
              Browse Files
            </Button>
          </div>
        </div>
      </div>
      
      {hasSelection && stats.supported > 0 && (
        <div className="text-sm mt-1 space-y-1 text-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
            <span className="font-medium">{stats.supported}</span>
            <span className="ml-1">images ready</span>
            {stats.supported !== stats.total && (
              <span className="ml-1 text-indigo-500 dark:text-indigo-400">(from {stats.total} files)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 