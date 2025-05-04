"use client";

import { ReactNode, ElementType } from "react";
import { responsiveSpacing } from "../lib/utils/responsiveSpacing";

interface ResponsiveContainerProps {
  children: ReactNode;
  as?: ElementType;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  noMargin?: boolean;
  centerContent?: boolean;
}

/**
 * ResponsiveContainer component that implements proper spacing
 * adjustments for different screen sizes
 */
const ResponsiveContainer = ({
  children,
  as: Component = "div",
  size = "md",
  className = "",
  fullWidth = false,
  noPadding = false,
  noMargin = false,
  centerContent = false,
}: ResponsiveContainerProps) => {
  // Get responsive margin classes
  const marginClasses = !noMargin ? responsiveSpacing.container[size] : "";

  // Max width based on size
  const maxWidthClasses = !fullWidth
    ? {
        sm: "max-w-screen-sm",
        md: "max-w-screen-lg",
        lg: "max-w-screen-xl",
      }[size]
    : "";

  // Padding classes
  const paddingClasses = !noPadding
    ? {
        sm: "px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8",
        md: "px-5 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10",
        lg: "px-6 py-8 sm:px-10 sm:py-10 md:px-16 md:py-12",
      }[size]
    : "";

  // Centering classes
  const centerClasses = centerContent ? "flex flex-col items-center" : "";

  return (
    <Component
      className={`w-full ${marginClasses} ${maxWidthClasses} ${paddingClasses} ${centerClasses} ${className}`}
    >
      {children}
    </Component>
  );
};

export default ResponsiveContainer; 