"use client";

import { ReactNode, ElementType } from "react";

interface ScreenReaderTextProps {
  children: ReactNode;
  id?: string;
  as?: ElementType;
}

/**
 * A component that visually hides content but keeps it accessible to screen readers.
 * Use this for providing additional context to screen reader users without affecting visual layout.
 * 
 * Usage:
 * <ScreenReaderText>Additional information for screen readers</ScreenReaderText>
 */
const ScreenReaderText = ({ 
  children, 
  id,
  as: Component = "span" 
}: ScreenReaderTextProps) => {
  return (
    <Component
      id={id}
      className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 -m-px" 
      style={{ 
        clip: "rect(0, 0, 0, 0)",
        clipPath: "inset(50%)",
      }}
    >
      {children}
    </Component>
  );
};

export default ScreenReaderText; 