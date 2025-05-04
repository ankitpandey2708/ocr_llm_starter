"use client";

import { useState } from "react";
import { GridSystem } from "@/components";
import ImageZoom from "./ImageZoom";
import { X, ZoomIn } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

interface ImageGalleryViewProps {
  images: ImageItem[];
  onRemove?: (id: string) => void;
  className?: string;
  gridColumns?: { sm?: number; md?: number; lg?: number; xl?: number };
  selectable?: boolean;
  onSelect?: (selectedIds: string[]) => void;
}

/**
 * ImageGalleryView component provides a grid-based gallery for reviewing multiple images
 * Supports selection, zooming, and responsive layouts
 */
const ImageGalleryView = ({
  images,
  onRemove,
  className = "",
  gridColumns = { sm: 1, md: 2, lg: 3, xl: 4 },
  selectable = false,
  onSelect,
}: ImageGalleryViewProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<ImageItem | null>(null);

  // Toggle selection of an image
  const toggleSelection = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    
    setSelectedIds(newSelection);
    
    if (onSelect) {
      onSelect(newSelection);
    }
  };

  // Handle zooming
  const handleZoom = (image: ImageItem) => {
    setZoomedImage(image);
  };

  // Close zoom view
  const closeZoom = () => {
    setZoomedImage(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <GridSystem
        columns={gridColumns}
        gap="md"
        className="w-full"
      >
        {images.map((image) => (
          <GalleryItem
            key={image.id}
            image={image}
            onRemove={onRemove}
            onZoom={() => handleZoom(image)}
            isSelected={selectable && selectedIds.includes(image.id)}
            onToggleSelect={selectable ? () => toggleSelection(image.id) : undefined}
          />
        ))}
      </GridSystem>

      {/* Empty state */}
      {images.length === 0 && (
        <div className="w-full rounded-md border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No images to display.
          </p>
        </div>
      )}

      {/* Image zoom modal */}
      {zoomedImage && (
        <ImageZoom
          imageUrl={zoomedImage.url}
          imageAlt={zoomedImage.name}
          isOpen={Boolean(zoomedImage)}
          onClose={closeZoom}
        />
      )}
    </div>
  );
};

interface GalleryItemProps {
  image: ImageItem;
  onRemove?: (id: string) => void;
  onZoom: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const GalleryItem = ({
  image,
  onRemove,
  onZoom,
  isSelected = false,
  onToggleSelect,
}: GalleryItemProps) => {
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-lg border transition-all ${
        isSelected 
          ? "border-primary ring-2 ring-primary" 
          : "border-gray-200 dark:border-gray-700"
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={image.url}
          alt={image.name}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onClick={onToggleSelect}
        />
      </div>
      
      {/* Image overlay with controls */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onZoom}
            className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Zoom image"
          >
            <ZoomIn size={20} />
          </button>
          
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(image.id)}
              className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Remove image"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Image caption */}
      <div className="p-2 text-center">
        <p className="truncate text-sm text-gray-700 dark:text-gray-300">
          {image.name}
        </p>
      </div>
    </motion.div>
  );
};

export default ImageGalleryView; 