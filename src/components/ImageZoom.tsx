"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageZoomProps {
  imageUrl: string;
  imageAlt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoom = ({ imageUrl, imageAlt, isOpen, onClose }: ImageZoomProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const increaseZoom = () => setZoomLevel(Math.min(zoomLevel + 0.5, 4));
  const decreaseZoom = () => setZoomLevel(Math.max(zoomLevel - 0.5, 0.5));

  // Close on escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div 
            className="relative w-full max-w-5xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-4 top-4 z-10 flex gap-2">
              <button
                onClick={increaseZoom}
                className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={decreaseZoom}
                className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={onClose}
                className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <motion.div
              className="overflow-hidden rounded-lg bg-black"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <motion.div
                drag
                dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                style={{
                  touchAction: "none", // Disable browser touch actions
                }}
              >
                <motion.img
                  src={imageUrl}
                  alt={imageAlt}
                  className={`max-h-[80vh] w-auto object-contain ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  animate={{
                    scale: zoomLevel,
                    transition: { duration: 0.2 },
                  }}
                  onClick={(e) => {
                    // Prevent closing the modal when clicking the image
                    e.stopPropagation();
                  }}
                />
              </motion.div>
            </motion.div>
            <div className="mt-2 text-center text-white">
              <p>{imageAlt}</p>
              <p className="text-sm text-gray-300">Zoom: {zoomLevel}x</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageZoom; 