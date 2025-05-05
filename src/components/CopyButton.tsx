"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: number;
}

const CopyButton = ({ text, className = "", size = 18 }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      // Reset the icon after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`p-1.5 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <Check size={size} className="text-success" />
      ) : (
        <Copy size={size} className="text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
};

export default CopyButton; 