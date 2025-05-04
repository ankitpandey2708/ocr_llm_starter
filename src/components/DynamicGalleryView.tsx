"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ProcessingIndicator } from "./ProcessingIndicator";

// Dynamically import the ImageGalleryView component
// This will be code-split and loaded only when needed
const ImageGalleryView = dynamic(() => import("./ImageGalleryView"), {
  loading: () => (
    <div className="w-full h-48 flex items-center justify-center">
      <ProcessingIndicator isProcessing={true} processingText="Loading gallery view..." />
    </div>
  ),
  ssr: false, // Disable SSR for this component to reduce initial load
});

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

interface DynamicGalleryViewProps {
  images: ImageItem[];
  onRemove?: (id: string) => void;
  className?: string;
  gridColumns?: { sm?: number; md?: number; lg?: number; xl?: number };
  selectable?: boolean;
  onSelect?: (selectedIds: string[]) => void;
}

/**
 * DynamicGalleryView is a wrapper that dynamically loads the ImageGalleryView component
 * This implements code-splitting for faster initial page load
 */
const DynamicGalleryView = (props: DynamicGalleryViewProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Only render the component client-side to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <ProcessingIndicator isProcessing={true} processingText="Loading gallery view..." />
      </div>
    );
  }

  return <ImageGalleryView {...props} />;
};

export default DynamicGalleryView; 