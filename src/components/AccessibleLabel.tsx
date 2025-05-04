"use client";

import { ReactNode } from "react";
import ScreenReaderText from "./ScreenReaderText";

interface AccessibleLabelProps {
  /** The visible content that might need additional description */
  children: ReactNode;
  
  /** Additional descriptive text for screen readers only */
  description?: string;
  
  /** ID to connect label with input (for="id") */
  htmlFor?: string;
  
  /** Whether to hide the children visually and only show to screen readers */
  srOnly?: boolean;
  
  /** Optional additional className */
  className?: string;
  
  /** Whether this is a required field (adds "required" to label) */
  required?: boolean;
}

/**
 * AccessibleLabel ensures proper labeling of interactive elements
 * 
 * Use cases:
 * 1. Add descriptive text for screen readers only
 * 2. Connect labels to form elements
 * 3. Create visually hidden labels that are accessible to screen readers
 */
const AccessibleLabel = ({
  children,
  description,
  htmlFor,
  srOnly = false,
  className = "",
  required = false,
}: AccessibleLabelProps) => {
  const Component = htmlFor ? "label" : "span";
  const requiredIndicator = required ? (
    <>
      <span aria-hidden="true" className="ml-1 text-error">
        *
      </span>
      <ScreenReaderText>required</ScreenReaderText>
    </>
  ) : null;

  const props = htmlFor ? { htmlFor } : {};

  if (srOnly) {
    return (
      <>
        <ScreenReaderText as={Component} {...props}>
          {children}
          {requiredIndicator}
        </ScreenReaderText>
        {description && <ScreenReaderText>{description}</ScreenReaderText>}
      </>
    );
  }

  return (
    <>
      <Component
        className={`inline-flex items-center ${className}`}
        {...props}
      >
        {children}
        {requiredIndicator}
      </Component>
      {description && <ScreenReaderText>{description}</ScreenReaderText>}
    </>
  );
};

export default AccessibleLabel; 