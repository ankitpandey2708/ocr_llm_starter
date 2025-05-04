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
    <div className="flex flex-col items-center justify-center gap-5 py-8 px-6 border-slate-200 dark:border-slate-700 border rounded-xl bg-slate-50 dark:bg-slate-800/40 shadow-inner">
      <div className="relative">
        {/* Outer animated glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 blur-xl opacity-30 animate-pulse"></div>
        {/* Spinner container */}
        <div className="relative bg-white dark:bg-slate-800 shadow-lg rounded-full p-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">{processingText}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          This may take a moment depending on the number of images.
          Please don&apos;t close the browser window.
        </p>
      </div>
    </div>
  );
} 