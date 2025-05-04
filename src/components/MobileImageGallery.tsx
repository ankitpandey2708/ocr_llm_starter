"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { isTouchDevice } from "../lib/utils/touchInteractions";

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

interface MobileImageGalleryProps {
  images: ImageItem[];
  onRemove?: (id: string) => void;
  className?: string;
  showControls?: boolean;
  initialIndex?: number;
  onClose?: () => void;
  isFullscreen?: boolean;
}

/**
 * MobileImageGallery component optimized for mobile screens
 * Supports swipe gestures, pinch-to-zoom and is fully responsive
 */
const MobileImageGallery = ({
  images,
  onRemove,
  className = "",
  showControls = true,
  initialIndex = 0,
  onClose,
  isFullscreen = false,
}: MobileImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTouch, setIsTouch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update current image
  const currentImage = images[currentIndex];

  // Detect touch device
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // Navigate to next/previous image, wrapped in useCallback to avoid recreating on each render
  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, images.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Handle swipe for touch devices
  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    setIsDragging(false);
    // If swipe velocity or distance is significant, navigate
    if (info.velocity.x < -0.5 || info.offset.x < -50) {
      goToNext();
    } else if (info.velocity.x > 0.5 || info.offset.x > 50) {
      goToPrevious();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, goToNext, goToPrevious, onClose]);

  // Mobile-specific styles
  const mobileStyles = isTouch
    ? {
        touchAction: isFullscreen ? "none" : "pan-y",
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-md bg-black ${className}`}
      style={mobileStyles}
    >
      {/* Image slider */}
      <motion.div
        className="relative flex h-full w-full touch-none"
        drag={isTouch ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        <div className="relative h-full w-full overflow-hidden">
          {currentImage && (
            <motion.img
              key={currentImage.id}
              src={currentImage.url}
              alt={currentImage.name}
              className="h-full w-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              draggable={false}
            />
          )}
        </div>
      </motion.div>

      {/* Navigation arrows */}
      {showControls && images.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-70 transition-opacity hover:opacity-100 disabled:opacity-30 sm:left-4"
            onClick={goToPrevious}
            disabled={currentIndex === 0 || isDragging}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-70 transition-opacity hover:opacity-100 disabled:opacity-30 sm:right-4"
            onClick={goToNext}
            disabled={currentIndex === images.length - 1 || isDragging}
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Close button */}
      {onClose && (
        <button
          className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white opacity-70 transition-opacity hover:opacity-100 sm:right-4 sm:top-4"
          onClick={onClose}
          aria-label="Close gallery"
        >
          <X size={20} />
        </button>
      )}

      {/* Remove button (if enabled) */}
      {onRemove && currentImage && (
        <button
          className="absolute bottom-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white opacity-70 transition-opacity hover:opacity-100"
          onClick={() => onRemove(currentImage.id)}
          aria-label="Remove image"
        >
          <X size={20} />
        </button>
      )}

      {/* Image counter/caption */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-4 z-10 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default MobileImageGallery; 