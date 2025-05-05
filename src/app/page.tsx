"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderSelector, ImageFile } from "@/components/FolderSelector";
import { ProcessingIndicator } from "@/components/ProcessingIndicator";
import { Button } from "@/components/Button";
import { toast } from "react-toastify";
import { FileText, Download, X, FileType } from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import CopyButton from "@/components/CopyButton";
import Image from "next/image";

// Interface definitions
interface OcrResult {
  fileName: string;
  text?: string;
  error?: string;
  success: boolean;
  imageUrl?: string;
}

interface ApiResponse {
  results: OcrResult[];
  summary: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
  };
}

// Helper function to convert File to Base64 data URL with optimization
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Create an image to get dimensions
      const img = new window.Image();
      img.onload = () => {
        // If image is large, optimize it before converting to base64
        if (img.width > 1200 || img.height > 1200) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions while maintaining aspect ratio
          let newWidth = img.width;
          let newHeight = img.height;
          const maxDimension = 1200;
          
          if (img.width > maxDimension || img.height > maxDimension) {
            if (img.width > img.height) {
              newWidth = maxDimension;
              newHeight = (img.height / img.width) * maxDimension;
            } else {
              newHeight = maxDimension;
              newWidth = (img.width / img.height) * maxDimension;
            }
          }
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Get optimized data URL
          const optimizedDataUrl = canvas.toDataURL(file.type, 0.8); // 0.8 quality
          resolve(optimizedDataUrl);
        } else {
          // If image is already small, use the original
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.onerror = error => reject(error);
  });
};

export default function Home() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [hasSelectedFolder, setHasSelectedFolder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState<OcrResult[] | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(true);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [resetFolderSelector, setResetFolderSelector] = useState(false);
  const [ocrProcessedThisSession, setOcrProcessedThisSession] = useState(false);

  // Load form state from localStorage on initial load
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      try {
        // Retrieve saved OCR results
        const savedOcrResults = localStorage.getItem('ocrResults');
        if (savedOcrResults) {
          setOcrResults(JSON.parse(savedOcrResults));
        }
        
        // We don't persist actual image files since they're too large,
        // but we can track if results exist
        const hasResults = savedOcrResults !== null;
        if (hasResults) {
          setHasSelectedFolder(true);
        }
        
        // Load debug preference
        const savedDebugPref = localStorage.getItem('showDebug');
        if (savedDebugPref !== null) {
          setShowDebug(JSON.parse(savedDebugPref));
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        // Clear potentially corrupted storage
        localStorage.removeItem('ocrResults');
        localStorage.removeItem('showDebug');
      }
    }
  }, []);

  // Persist OCR results when they change
  useEffect(() => {
    if (ocrResults && typeof window !== 'undefined') {
      localStorage.setItem('ocrResults', JSON.stringify(ocrResults));
    }
  }, [ocrResults]);

  // Persist debug preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showDebug', JSON.stringify(showDebug));
    }
  }, [showDebug]);

  // Clear persisted data when starting fresh
  const clearPersistedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ocrResults');
      // Don't remove debug preference as that's a user setting
    }
  }, []);

  // Show toast for OCR result errors
  useEffect(() => {
    if (ocrResults) {
      // Find failed results and show toast for each one
      const failedResults = ocrResults.filter(result => !result.success && result.error);
      failedResults.forEach(result => {
        toast.error(`${result.error}`);
      });
    }
  }, [ocrResults]);

  // Enhanced cleanup function for image URLs
  const cleanupImageURLs = useCallback(() => {
    // Release object URLs to prevent memory leaks
    imageFiles.forEach(imageFile => {
      URL.revokeObjectURL(imageFile.preview);
    });
    // Log that cleanup happened
    console.log(`Cleaned up ${imageFiles.length} image preview URLs`);
  }, [imageFiles]);

  // Clean up object URLs when component unmounts or when imageFiles changes
  useEffect(() => {
    return () => {
      cleanupImageURLs();
    };
  }, [imageFiles, cleanupImageURLs]);

  // Additional cleanup after successful PDF generation
  useEffect(() => {
    if (pdfUrl) {
      // Wait a moment after PDF download completes before resetting the app
      const resetTimer = setTimeout(() => {
        toast.info("Ready for the next batch of images!");
        
        // Clean up base64 image data from memory once we have the PDF
        // This is handled by setting state, which will trigger GC
        setImageFiles(prev => {
          // Clean up object URLs first
          prev.forEach(imageFile => {
            URL.revokeObjectURL(imageFile.preview);
          });
          
          console.log('Cleaned up image previews after PDF generation');
          
          // Return empty array to remove all image data from state
          return [];
        });
        
        // Reset app state to initial state
        setHasSelectedFolder(false);
        setOcrResults(null);
        setPdfUrl(null);
        setOcrError(null);
        setPdfError(null);
        setOcrProcessedThisSession(false); // Reset the OCR processed flag
        
        // Trigger FolderSelector reset
        setResetFolderSelector(true);
        
      }, 2000); // 2 second delay before reset
      
      return () => clearTimeout(resetTimer);
    }
  }, [pdfUrl]);
  
  // Reset the resetFolderSelector flag after it's been used
  useEffect(() => {
    if (resetFolderSelector) {
      // Reset the flag after a brief delay to ensure the component has time to respond
      const flagResetTimer = setTimeout(() => {
        setResetFolderSelector(false);
      }, 500);
      
      return () => clearTimeout(flagResetTimer);
    }
  }, [resetFolderSelector]);

  // Modified handleFolderSelect to clear persisted data
  const handleFolderSelect = (files: ImageFile[]) => {
    // Clean up previous object URLs if any
    cleanupImageURLs();
    
    // Clear previous results when selecting new files
    if (files.length > 0) {
      clearPersistedData();
    }
    
    setImageFiles(files);
    setHasSelectedFolder(files.length > 0);
    setOcrResults(null); // Reset previous results when selecting a new folder
    setPdfUrl(null); // Reset PDF URL when selecting a new folder
    setOcrError(null); // Reset OCR errors when selecting a new folder
    setPdfError(null); // Reset PDF errors when selecting a new folder
    setOcrProcessedThisSession(false); // Reset the OCR processed flag when selecting a new folder
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prevFiles => {
      // Create a copy of the array without the removed image
      const updatedFiles = [...prevFiles];
      
      // Release the object URL to prevent memory leaks
      URL.revokeObjectURL(updatedFiles[index].preview);
      
      // Remove the image from the array
      updatedFiles.splice(index, 1);
      
      // If this was the last image, reset the app state
      if (updatedFiles.length === 0) {
        // Reset folder selection state
        setHasSelectedFolder(false);
        setOcrResults(null);
        setPdfUrl(null);
        setOcrError(null);
        setPdfError(null);
        setOcrProcessedThisSession(false); // Reset the OCR processed flag
        
        // Trigger FolderSelector reset to hide the "X images ready" message
        setResetFolderSelector(true);
      }
      // We don't need the else branch anymore as the FolderSelector will
      // automatically update based on the currentFiles and currentFolder props
      
      return updatedFiles;
    });
  };

  // Modified processImages to save state after processing
  const processImages = async () => {
    setIsProcessing(true);
    setOcrResults(null);
    setPdfUrl(null);
    setOcrError(null); // Reset OCR errors before processing

    try {
      // Log MIME types of all images for debugging
      console.log("Processing images:", imageFiles.length);
      
      // Convert images to base64 for later PDF generation
      const imageBase64Map = new Map<string, string>();
      
      // Process each image file
      for (const imageFile of imageFiles) {
        try {
          // Get the correct path/filename for matching later
          const fileName = imageFile.file.webkitRelativePath || imageFile.file.name;
          
          const base64 = await fileToBase64(imageFile.file);
          console.log(`Converted ${fileName} to base64 (length: ${base64.length})`);
          
          // Store with both potential keys for matching
          imageBase64Map.set(fileName, base64);  // Full path
          imageBase64Map.set(imageFile.file.name, base64);  // Just filename
        } catch (error) {
          console.error(`Failed to convert ${imageFile.file.name} to base64:`, error);
        }
      }

      // Log how many images were successfully converted
      console.log(`Successfully converted ${imageBase64Map.size} of ${imageFiles.length} images to base64`);

      const formData = new FormData();
      imageFiles.forEach(imageFile => {
        formData.append('files', imageFile.file);
      });

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as ApiResponse;
      
      // Add image data URLs to OCR results, trying both full path and filename
      const resultsWithImageUrls = data.results.map(result => {
        // First try the full name as returned by the OCR API
        let base64 = imageBase64Map.get(result.fileName);
        
        // If not found, try extracting just the filename without path
        if (!base64) {
          const filename = result.fileName.split(/[\/\\]/).pop() || result.fileName;
          base64 = imageBase64Map.get(filename);
        }
        
        console.log(`Finding base64 for ${result.fileName}: ${base64 ? 'Found' : 'Not found'}`);
        
        return {
          ...result,
          imageUrl: base64 || '' // Use actual base64 data
        };
      });
      
      // Debug log the results with image data
      const debugSummary = resultsWithImageUrls.map(r => ({
        fileName: r.fileName,
        hasBase64: !!r.imageUrl && r.imageUrl.length > 0,
        base64Length: r.imageUrl?.length || 0
      }));
      console.log("Results with base64 images:", debugSummary);
      
      setOcrResults(resultsWithImageUrls);
      setOcrProcessedThisSession(true);
      
      // Show toast with summary
      const { successCount, failureCount } = data.summary;
      if (failureCount === 0) {
        toast.success(`Successfully processed all ${successCount} images!`);
      }
      
      // Clean up image base64 data from memory since OCR is done
      // We no longer need the full image data in memory
      imageBase64Map.clear();
      
    } catch (error) {
      console.error('Error processing images:', error);
      setOcrError(error instanceof Error ? error.message : 'An unexpected error occurred during OCR processing');
      setOcrResults(null); // Clear any partial results
      
      // Clean up image data even if processing fails
      cleanupImageURLs();
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePdf = async () => {
    if (!ocrResults || ocrResults.length === 0) {
      toast.error("No OCR results available. Please process images first.");
      return;
    }

    setIsPdfGenerating(true);
    setPdfError(null); // Reset PDF errors before generation
    
    try {
      // Send only successful results with base64 image data
      const successfulResults = ocrResults.filter(result => 
        result.success && result.text
      );
      
      // Debug log the image data in successful results
      const successfulWithImages = successfulResults.filter(r => r.imageUrl && r.imageUrl.length > 0);
      console.log(`Found ${successfulWithImages.length} out of ${successfulResults.length} successful results with image data`);
      
      if (successfulResults.length === 0) {
        throw new Error("No successful OCR results available for PDF generation");
      }
      
      // Continue even if some images are missing - PDF generator will show placeholders
      console.log("Sending results for PDF generation:", successfulResults.length);
      
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ocrResults: successfulResults }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("PDF generation error response:", errorData);
        throw new Error(errorData.error || `Failed to generate PDF: ${response.status}`);
      }

      // Create a blob URL from the PDF response
      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      
      // Automatically trigger download
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
      const filename = `ocr_results_${timestamp}.pdf`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Store URL for cleanup and trigger the reset timer
      setPdfUrl(url);
      toast.success("PDF downloaded successfully!");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPdfError(error instanceof Error ? error.message : 'An unexpected error occurred during PDF generation');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Cleanup function to revoke PDF blob URL
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const showNoImagesWarning = hasSelectedFolder && imageFiles.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <header className="w-full py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl p-3 shadow-md shadow-indigo-500/10">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">OmniScan OCR</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Extract text from images with precision</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid gap-8 md:gap-12">
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-slate-900/30 overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2">
                  <FileType className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold">Select Images</h2>
              </div>
              
              <div className="py-2">
                <FolderSelector 
                  onFolderSelect={handleFolderSelect}
                  reset={resetFolderSelector}
                  currentFiles={imageFiles}
                />
              </div>
              
              {showNoImagesWarning}
              
              {hasSelectedFolder && imageFiles.length > 0 && (
                <div className="mt-6 relative">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={`image-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                        <div className="relative w-full h-48">
                          <Image
                            src={file.preview}
                            alt={file.file.name}
                            className="object-cover transition-opacity group-hover:opacity-75"
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            priority={index < 4}
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X size={16} />
                        </button>
                        <div className="p-2 text-xs truncate bg-white dark:bg-gray-800">
                          {file.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {imageFiles.length > 0 && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-slate-900/30 overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Extract Text</h2>
                </div>
                
                <ProcessingIndicator isProcessing={isProcessing} />
                
                {!isProcessing && ocrError && (
                  <div className="mb-6">
                    <ErrorDisplay message={ocrError} category="OCR" />
                  </div>
                )}
                
                {!isProcessing && (
                  <div className="flex justify-center py-4">
                    <Button 
                      onClick={processImages} 
                      className="flex items-center gap-2"
                      size="lg"
                      variant="primary"
                      disabled={isProcessing}
                    >
                      <FileText className="w-5 h-5" />
                      Extract Text
                    </Button>
                  </div>
                )}

                {ocrResults && ocrResults.length > 0 && !isProcessing && (
                  <div className="mt-8 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Extracted Text Results</h2>
                    
                    {/* Add a copy all button for all extracted text */}
                    {ocrResults.some(result => result.success && result.text) && (
                      <div className="flex items-center mb-4">
                        <CopyButton 
                          text={ocrResults
                            .filter(result => result.success && result.text)
                            .map(result => `[${result.fileName}]\n${result.text}`)
                            .join('\n\n')
                          }
                          size={20}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Copy all extracted text</span>
                      </div>
                    )}
                    
                    {ocrResults.map((result, index) => (
                      <div key={`ocr-result-${index}`} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{result.fileName}</h3>
                          
                          {/* Add copy button for individual text results */}
                          {result.success && result.text && (
                            <CopyButton text={result.text} />
                          )}
                        </div>
                        
                        {result.success ? (
                          <div className="mt-2">
                            {result.text ? (
                              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm font-mono">
                                {result.text}
                              </div>
                            ) : (
                              <p className="text-amber-600 dark:text-amber-400">No text was detected in this image.</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                            {result.error || "Failed to process image"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Only show the Download Results section if OCR was processed in this session */}
          {ocrResults && ocrResults.length > 0 && !isProcessing && ocrProcessedThisSession && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-slate-900/30 overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2">
                    <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Download Results</h2>
                </div>
                
                <ProcessingIndicator isProcessing={isPdfGenerating} processingText="Generating PDF..." />
                
                {!isPdfGenerating && pdfError && (
                  <div className="mb-6">
                    <ErrorDisplay message={pdfError} category="PDF" />
                  </div>
                )}
                
                {!isPdfGenerating && ocrResults.filter(r => r.success).length > 0 && (
                  <div className="flex flex-col items-center py-4 space-y-3">
                    <Button 
                      onClick={generatePdf} 
                      className="flex items-center gap-2"
                      size="lg"
                      variant="primary"
                      disabled={isPdfGenerating}
                    >
                      <Download className="w-5 h-5" />
                      Download PDF
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

    </div>
  );
}
