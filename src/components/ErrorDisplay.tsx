"use client";

import { XCircle, AlertTriangle } from "lucide-react";

export interface ErrorDisplayProps {
  message: string;
  category?: 'OCR' | 'PDF';
}

export function ErrorDisplay({ 
  message, 
  category = 'OCR' 
}: ErrorDisplayProps) {
  if (!message) return null;
  
  // Configuration for different error categories
  const config = {
    OCR: {
      icon: <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />,
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border-red-200 dark:border-red-800/30',
      titleClass: 'text-red-800 dark:text-red-300',
      textClass: 'text-red-700 dark:text-red-300/80',
      title: 'OCR Process Failed'
    },
    PDF: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      bgClass: 'bg-amber-50 dark:bg-amber-900/20',
      borderClass: 'border-amber-200 dark:border-amber-800/30',
      titleClass: 'text-amber-800 dark:text-amber-300',
      textClass: 'text-amber-700 dark:text-amber-300/80',
      title: 'PDF Generation Issue'
    }
  };
  
  const { icon, bgClass, borderClass, titleClass, textClass, title } = config[category];
  
  return (
    <div className={`flex items-start p-4 rounded-xl border shadow-sm ${bgClass} ${borderClass}`} role="alert">
      <div className="mr-4 mt-0.5">{icon}</div>
      <div>
        <h4 className={`font-medium text-base mb-1 ${titleClass}`}>{title}</h4>
        <p className={`text-sm leading-relaxed ${textClass}`}>{message}</p>
      </div>
    </div>
  );
} 