"use client";

import { cn } from "@/lib/utils/shared";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card" | "image" | "button" | "avatar";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

/**
 * Skeleton component for creating loading placeholder UI
 * Shows a placeholder preview of content before it loads
 */
const Skeleton = ({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) => {
  // Base styles for all skeleton types
  const baseStyles = "bg-gray-200 dark:bg-gray-700 relative overflow-hidden";
  
  // Animation styles
  const animationStyles = {
    pulse: "animate-pulse",
    wave: "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    none: "",
  };

  // Variant-specific styles
  const variantStyles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
    card: "rounded-xl",
    image: "rounded-md",
    button: "h-10 rounded-lg",
    avatar: "h-10 w-10 rounded-full",
  };

  // Handle size props
  const sizeStyles = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={sizeStyles}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton with text layout for loading content with text lines
 */
export const SkeletonText = ({
  lines = 3,
  lastLineWidth = 70,
  className,
  animation = "pulse",
}: {
  lines?: number;
  lastLineWidth?: number;
  className?: string;
  animation?: "pulse" | "wave" | "none";
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} variant="text" animation={animation} />
      ))}
      {lines > 0 && (
        <Skeleton
          variant="text"
          width={`${lastLineWidth}%`}
          animation={animation}
        />
      )}
    </div>
  );
};

/**
 * Card content skeleton for loading card UI
 */
export const SkeletonCard = ({
  className,
  animation = "pulse",
}: {
  className?: string;
  animation?: "pulse" | "wave" | "none";
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
        className
      )}
    >
      <Skeleton
        variant="rectangular"
        height={200}
        animation={animation}
        className="w-full"
      />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="60%" animation={animation} />
        <SkeletonText lines={2} animation={animation} />
        <div className="flex justify-between pt-2">
          <Skeleton
            variant="button"
            width={100}
            animation={animation}
          />
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            animation={animation}
          />
        </div>
      </div>
    </div>
  );
};

export default Skeleton; 