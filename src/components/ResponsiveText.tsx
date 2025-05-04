"use client";

import { ReactNode, ElementType } from "react";
import { responsiveFontScale, lineHeights, fontSmoothing } from "@/lib/utils/responsiveFontScaling";

interface ResponsiveTextProps {
  children: ReactNode;
  as?: ElementType;
  variant?: keyof typeof responsiveFontScale | 
            "body.xs" | "body.sm" | "body.base" | "body.lg" | "body.xl" |
            "ui.xs" | "ui.sm" | "ui.base" | "ui.lg";
  lineHeight?: keyof typeof lineHeights;
  className?: string;
  antialiased?: boolean;
}

/**
 * ResponsiveText component ensures proper font scaling across devices
 * Uses predefined responsive typography scales
 */
const ResponsiveText = ({
  children,
  as: Component = "div",
  variant = "body.base",
  lineHeight = "body",
  className = "",
  antialiased = true,
}: ResponsiveTextProps) => {
  // Parse variant to handle nested objects like "body.base"
  const getTypographyClasses = () => {
    if (variant.includes(".")) {
      const [category, size] = variant.split(".");
      // @ts-expect-error - We're being dynamic here, but we know the structure
      return responsiveFontScale[category][size];
    }
    return responsiveFontScale[variant as keyof typeof responsiveFontScale];
  };

  const lineHeightClass = lineHeights[lineHeight];
  const fontSmoothingClass = antialiased ? fontSmoothing.antialiased : "";

  return (
    <Component
      className={`${getTypographyClasses()} ${lineHeightClass} ${fontSmoothingClass} ${className}`}
    >
      {children}
    </Component>
  );
};

export default ResponsiveText; 