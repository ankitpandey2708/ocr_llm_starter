"use client";

import { ReactNode, ElementType } from "react";

interface ReadableTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right" | "justify";
}

/**
 * ReadableText component ensures optimal line length for text content
 * Maintains 45-75 characters per line for better readability
 */
const ReadableText = ({
  children,
  as: Component = "div",
  className = "",
  size = "md",
  align = "left",
}: ReadableTextProps) => {
  // Max width classes to limit line length to 45-75 characters
  // These values are carefully calculated to ensure optimal character count per line
  const maxWidthClasses = {
    sm: "max-w-prose sm:max-w-[45ch] md:max-w-[55ch]", // ~45-55 chars
    md: "max-w-prose sm:max-w-[55ch] md:max-w-[65ch]", // ~55-65 chars
    lg: "max-w-prose sm:max-w-[65ch] md:max-w-[75ch]", // ~65-75 chars
  };

  // Text alignment classes
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  return (
    <Component
      className={`${maxWidthClasses[size]} ${alignClasses[align]} ${className}`}
    >
      {children}
    </Component>
  );
};

export default ReadableText; 