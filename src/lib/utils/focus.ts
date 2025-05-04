/**
 * Focus utilities for managing focus states and spacing
 */

// Common focus styles with appropriate spacing and outline
export const focusClasses = {
  default: "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900",
  subtle: "focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50 focus:ring-offset-1 dark:focus:ring-offset-gray-900",
  within: "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900",
  visible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
};

// Different spacing options for different element types
export const focusSpacingByElement = {
  button: "focus:ring-offset-2",
  input: "focus:ring-offset-1",
  card: "focus:ring-offset-1",
  link: "focus:ring-offset-1",
  icon: "focus:ring-offset-1",
  menu: "focus:ring-offset-0",
};

// Focus styles with different colors
export const focusColorVariants = {
  primary: "focus:ring-primary",
  success: "focus:ring-success",
  error: "focus:ring-error",
  warning: "focus:ring-warning",
  info: "focus:ring-info",
};

// Combine focus styles for a specific element and color
export const getFocusClasses = (
  element: keyof typeof focusSpacingByElement = "button",
  color: keyof typeof focusColorVariants = "primary",
  type: keyof typeof focusClasses = "default"
) => {
  return `${focusClasses[type]} ${focusSpacingByElement[element]} ${focusColorVariants[color]}`;
};

// Generate focus styles for different states
export const getFocusStyle = (color = "primary", width = 2, offset = 2) => {
  return {
    outline: "none",
    boxShadow: `0 0 0 ${offset}px var(--background), 0 0 0 ${offset + width}px var(--${color})`,
  };
};

// Add appropriate whitespace for focus pseudo class to CSS
export const getFocusSpacingCss = () => {
  return `
    .focus-spacing::focus {
      padding: 0.25rem;
      margin: -0.25rem;
    }
    
    .focus-spacing-sm::focus {
      padding: 0.125rem;
      margin: -0.125rem;
    }
    
    .focus-spacing-lg::focus {
      padding: 0.375rem;
      margin: -0.375rem;
    }
  `;
}; 