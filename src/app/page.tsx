"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderSelector, ImageFile } from "@/components/FolderSelector";
import { ProcessingIndicator } from "@/components/ProcessingIndicator";
import { Button } from "@/components/Button";
import { toast } from "react-toastify";
import { FileText, Download, AlertCircle, X } from "lucide-react";
import { DebugInfo } from "@/components/DebugInfo";
import { ErrorDisplay } from "@/components/ErrorDisplay";

// Helper function to check image magic numbers
const validateImageMagicNumbers = async (file: File): Promise<boolean> => {
  try {
    // Read the first few bytes of the file
    const headerBytes = await file.slice(0, 12).arrayBuffer();
    const headerView = new Uint8Array(headerBytes);
    
    // JPEG format: FF D8 FF
    if (headerView[0] === 0xFF && headerView[1] === 0xD8 && headerView[2] === 0xFF) {
      console.log(`File: ${file.name} - Magic number confirms JPEG format`);
      return true;
    } 
    // PNG format: 89 50 4E 47 0D 0A 1A 0A
    else if (
      headerView[0] === 0x89 && headerView[1] === 0x50 && 
      headerView[2] === 0x4E && headerView[3] === 0x47 &&
      headerView[4] === 0x0D && headerView[5] === 0x0A &&
      headerView[6] === 0x1A && headerView[7] === 0x0A
    ) {
      console.log(`File: ${file.name} - Magic number confirms PNG format`);
      return true;
    } 
    // Magic numbers don't match known image formats
    else {
      console.warn(`File: ${file.name} - Magic number doesn't match supported image formats`);
      return false;
    }
  } catch (error) {
    console.error(`Error validating file format for ${file.name}:`, error);
    return false;
  }
};

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

// Helper function to convert File to Base64 data URL
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function Home() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [hasSelectedFolder, setHasSelectedFolder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState<OcrResult[] | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(true);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [resetFolderSelector, setResetFolderSelector] = useState(false);

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
        setSelectedFolder(null);
        setHasSelectedFolder(false);
        setOcrResults(null);
        setPdfUrl(null);
        setOcrError(null);
        setPdfError(null);
        
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

  const handleFolderSelect = (files: ImageFile[]) => {
    // Clean up previous object URLs if any
    cleanupImageURLs();
    
    setImageFiles(files);
    setSelectedFolder(files.length > 0 ? "Selected files" : null);
    setHasSelectedFolder(files.length > 0);
    setOcrResults(null); // Reset previous results when selecting a new folder
    setPdfUrl(null); // Reset PDF URL when selecting a new folder
    setOcrError(null); // Reset OCR errors when selecting a new folder
    setPdfError(null); // Reset PDF errors when selecting a new folder
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
        setSelectedFolder(null);
        setHasSelectedFolder(false);
        setOcrResults(null);
        setPdfUrl(null);
        setOcrError(null);
        setPdfError(null);
        
        // Trigger FolderSelector reset to hide the "X images ready" message
        setResetFolderSelector(true);
      }
      // We don't need the else branch anymore as the FolderSelector will
      // automatically update based on the currentFiles and currentFolder props
      
      return updatedFiles;
    });
  };

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
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Image OCR to PDF Converter</h1>
        <p className="text-lg text-muted-foreground">
          Convert images to a side-by-side PDF with extracted text
        </p>
      </header>

      <main className="w-full max-w-3xl mx-auto space-y-8">
        <section className="bg-card p-8 rounded-lg shadow-sm border-gray-200 border">
          <h2 className="text-2xl font-semibold mb-6">Select Images</h2>
          <div className="py-4">
            <FolderSelector 
              onFolderSelect={handleFolderSelect}
              reset={resetFolderSelector}
              currentFiles={imageFiles}
            />
          </div>
          
          {showNoImagesWarning }
          
          {imageFiles.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-3">Supported Images Found:</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 text-sm">
                {imageFiles.map((imageFile, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 p-2 bg-background rounded border-gray-200 border"
                  >
                    <div 
                      className="w-8 h-8 flex-shrink-0 bg-cover bg-center rounded" 
                      style={{ backgroundImage: `url(${imageFile.preview})` }}
                    />
                    <span className="truncate flex-1">{imageFile.file.name}</span>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {imageFiles.length > 0 && (
          <section className="bg-card p-8 rounded-lg shadow-sm border-gray-200 border">
            <h2 className="text-2xl font-semibold mb-6">Process Images</h2>
            
            <ProcessingIndicator isProcessing={isProcessing} />
            
            {!isProcessing && ocrError && (
              <div className="mb-4">
                <ErrorDisplay message={ocrError} category="OCR" />
              </div>
            )}
            
            {!isProcessing && (
              <div className="flex justify-center py-4">
                <Button 
                  onClick={processImages} 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transform hover:scale-105 transition-all shadow-lg"
                  size="lg"
                  disabled={isProcessing}
                >
                  <FileText className="w-5 h-5" />
                  Extract Text
                </Button>
              </div>
            )}

            {ocrResults && ocrResults.length > 0 && !isProcessing && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <div className="max-h-80 overflow-y-auto space-y-2 text-sm">
                  {ocrResults.map((result, index) => (
                    result.success && (
                      <div 
                        key={index} 
                        className="p-3 rounded border bg-green-50 border-green-200"
                      >
                        <div className="whitespace-pre-wrap max-h-32 overflow-y-auto p-2 bg-white rounded border">
                          {result.text}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {ocrResults && ocrResults.length > 0 && !isProcessing && (
          <section>
            <ProcessingIndicator isProcessing={isPdfGenerating} processingText="Generating PDF..." />
            
            {!isPdfGenerating && pdfError && (
              <div className="mb-4">
                <ErrorDisplay message={pdfError} category="PDF" />
              </div>
            )}
            
            {!isPdfGenerating && ocrResults.filter(r => r.success).length > 0 && (
              <div className="flex flex-col items-center py-4 space-y-4">
                <Button 
                  onClick={generatePdf} 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transform hover:scale-105 transition-all shadow-lg"
                  size="lg"
                  disabled={isPdfGenerating}
                >
                  <FileText className="w-5 h-5" />
                  Download PDF
                </Button>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mt-auto pt-12 pb-6 text-center text-sm text-muted-foreground">
       
      </footer>
    </div>
  );
}
