"use client";

import { AlertCircle } from "lucide-react";

export interface ErrorDisplayProps {
  message: string;
  category?: 'OCR' | 'PDF';
}

export function ErrorDisplay({ 
  message, 
  category = 'OCR' 
}: ErrorDisplayProps) {
  if (!message) return null;
  
  const bgColor = category === 'OCR' ? 'bg-red-50' : 'bg-amber-50';
  const borderColor = category === 'OCR' ? 'border-red-200' : 'border-amber-200';
  const textColor = category === 'OCR' ? 'text-red-700' : 'text-amber-700';
  
  return (
    <div className={`flex items-start p-4 rounded-lg border ${bgColor} ${borderColor} ${textColor}`}>
      <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-medium mb-1">{category} Error</h4>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
} 