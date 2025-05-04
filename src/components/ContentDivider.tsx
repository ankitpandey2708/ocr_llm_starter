"use client";

import { ReactNode } from "react";

interface ContentDividerProps {
  children?: ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
  withLabel?: boolean;
  decorative?: boolean;
}

/**
 * ContentDivider component for visually separating content sections
 * Can be used as a simple line or with a label in the middle
 */
const ContentDivider = ({
  children,
  className = "",
  orientation = "horizontal",
  withLabel = false,
  decorative = true,
}: ContentDividerProps) => {
  // For screen readers, decorative dividers should be hidden with aria-hidden
  const ariaProps = decorative ? { "aria-hidden": true } : {};
  
  // Horizontal divider with optional label
  if (orientation === "horizontal") {
    if (withLabel && children) {
      return (
        <div 
          className={`relative flex items-center py-5 ${className}`}
          role={!decorative ? "separator" : undefined}
          {...ariaProps}
        >
          <div className="flex-grow border-t border-border dark:border-gray-700"></div>
          <span className="mx-3 flex-shrink text-sm text-gray-500 dark:text-gray-400">{children}</span>
          <div className="flex-grow border-t border-border dark:border-gray-700"></div>
        </div>
      );
    }
    
    return (
      <hr 
        className={`my-6 border-t border-border dark:border-gray-700 ${className}`}
        role={!decorative ? "separator" : undefined}
        {...ariaProps}
      />
    );
  }
  
  // Vertical divider
  return (
    <div 
      className={`mx-2 inline-block h-full w-px self-stretch bg-border dark:bg-gray-700 ${className}`}
      role={!decorative ? "separator" : undefined}
      aria-orientation="vertical"
      {...ariaProps}
    ></div>
  );
};

export default ContentDivider; 