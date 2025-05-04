"use client";

import { Loader2 } from "lucide-react";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  processingText?: string;
}

export function ProcessingIndicator({ 
  isProcessing, 
  processingText = "Processing images..."
}: ProcessingIndicatorProps) {
  if (!isProcessing) return null;
  
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 border-gray-200 border rounded-lg bg-muted">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-lg font-medium">{processingText}</p>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        This may take a moment depending on the number of images.
        <br />
        Please don't close the browser window.
      </p>
    </div>
  );
} 