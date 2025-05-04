"use client";

import { useState, useEffect } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { GripVertical, X, ZoomIn } from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

interface DraggableImagesProps {
  images: ImageItem[];
  onReorder: (newOrder: ImageItem[]) => void;
  onRemove: (id: string) => void;
  onZoom?: (image: ImageItem) => void;
  className?: string;
}

const DraggableImages = ({
  images,
  onReorder,
  onRemove,
  onZoom,
  className = "",
}: DraggableImagesProps) => {
  const [items, setItems] = useState<ImageItem[]>(images);

  // Update local state when images prop changes
  useEffect(() => {
    setItems(images);
  }, [images]);

  // Handle reordering
  const handleReorder = (newOrder: ImageItem[]) => {
    setItems(newOrder);
    onReorder(newOrder);
  };

  return (
    <div className={`w-full ${className}`}>
      <Reorder.Group 
        axis="y" 
        values={items} 
        onReorder={handleReorder}
        className="space-y-2"
      >
        {items.map((image) => (
          <DraggableImageItem
            key={image.id}
            image={image}
            onRemove={onRemove}
            onZoom={onZoom}
          />
        ))}
      </Reorder.Group>

      {items.length === 0 && (
        <div className="w-full rounded-md border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No images added. Upload images to get started.
          </p>
        </div>
      )}
    </div>
  );
};

interface DraggableImageItemProps {
  image: ImageItem;
  onRemove: (id: string) => void;
  onZoom?: (image: ImageItem) => void;
}

const DraggableImageItem = ({ 
  image, 
  onRemove,
  onZoom 
}: DraggableImageItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={image}
      dragControls={dragControls}
      className="relative flex w-full items-center rounded-md border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800 bg-subtle-pattern"
    >
      <div
        className="cursor-move px-2"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical size={20} className="text-gray-400" />
      </div>

      <div className="relative flex-1 flex items-center overflow-hidden">
        <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
          <img
            src={image.url}
            alt={image.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <span className="ml-3 truncate text-sm">{image.name}</span>
      </div>

      <div className="flex space-x-1">
        {onZoom && (
          <button
            type="button"
            onClick={() => onZoom(image)}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Zoom image"
          >
            <ZoomIn size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-error dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-error"
          aria-label="Remove image"
        >
          <X size={18} />
        </button>
      </div>
    </Reorder.Item>
  );
};

export default DraggableImages; 