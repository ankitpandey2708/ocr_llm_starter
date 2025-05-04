"use client";

import { GridSystem, Skeleton } from "@/components";

interface ImageGridSkeletonProps {
  count?: number;
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
  animation?: "pulse" | "wave" | "none";
  aspectRatio?: "square" | "video" | "wide";
  showCaption?: boolean;
}

/**
 * ImageGridSkeleton displays a placeholder grid of images while they're loading
 * Improves perceived performance by showing content structure before data arrives
 */
const ImageGridSkeleton = ({
  count = 6,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  className = "",
  animation = "pulse",
  aspectRatio = "square",
  showCaption = true,
}: ImageGridSkeletonProps) => {
  // Calculate aspect ratio classes
  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]",
  }[aspectRatio];

  return (
    <GridSystem columns={columns} gap="md" className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        >
          {/* Image skeleton */}
          <div className={aspectRatioClass}>
            <Skeleton variant="image" className="h-full w-full" animation={animation} />
          </div>

          {/* Caption skeleton */}
          {showCaption && (
            <div className="p-2">
              <Skeleton variant="text" width="80%" animation={animation} />
            </div>
          )}
        </div>
      ))}
    </GridSystem>
  );
};

export default ImageGridSkeleton; 