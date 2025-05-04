"use client";

import { ReactNode, ElementType } from "react";

interface BaselineGridProps {
  children: ReactNode;
  as?: ElementType;
  baseline?: number; // Baseline grid height in pixels
  className?: string;
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

/**
 * BaselineGrid ensures text elements are aligned to a consistent baseline grid
 * This improves vertical rhythm and creates a more harmonious layout
 */
const BaselineGrid = ({
  children,
  as: Component = "div",
  baseline = 8, // Default 8px baseline
  className = "",
  fontSize = "base",
}: BaselineGridProps) => {
  // Tailwind font sizes with their pixel equivalents
  const fontSizes = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  };

  // Calculate line height to match baseline grid
  const calculateLineHeight = (size: number) => {
    // Find the number of baseline units needed for this font size
    const baselineUnits = Math.ceil(size / baseline);
    // Calculate line height in pixels
    const lineHeightPx = baselineUnits * baseline;
    // Convert to unitless line height
    return (lineHeightPx / size).toFixed(3);
  };

  // Calculate the margin-bottom to align to baseline grid
  const calculateMarginBottom = (size: number) => {
    const lineHeight = parseFloat(calculateLineHeight(size));
    const totalHeight = size * lineHeight;
    const remainder = totalHeight % baseline;
    
    // If the element's height is already aligned to the grid, no adjustment needed
    if (remainder === 0) return 0;
    
    // Otherwise, add margin to reach the next baseline
    return baseline - remainder;
  };

  const pixelFontSize = fontSizes[fontSize];
  const lineHeight = calculateLineHeight(pixelFontSize);
  const marginBottom = calculateMarginBottom(pixelFontSize);

  // Font size classes from Tailwind
  const fontSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };

  return (
    <Component
      className={`${fontSizeClasses[fontSize]} ${className}`}
      style={{
        lineHeight,
        marginBottom: `${marginBottom}px`,
      }}
    >
      {children}
    </Component>
  );
};

export default BaselineGrid; 