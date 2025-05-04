/**
 * Utilities for ensuring proper button sizing on touch devices
 * Following accessibility guidelines for touch targets
 */

// Apple Human Interface Guidelines recommend minimum 44x44pt touch targets
// W3C/WAI recommends minimum 44x44px
// Material Design recommends 48x48dp with 8dp spacing

// Add these classes to global CSS for proper button sizing on touch devices
export const touchButtonSizingCSS = `
  /* Default touch button sizing */
  @media (hover: none) {
    button:not(.touch-size-exempt),
    .button:not(.touch-size-exempt),
    [role="button"]:not(.touch-size-exempt),
    a[href]:not(.touch-size-exempt),
    input[type="button"]:not(.touch-size-exempt),
    input[type="submit"]:not(.touch-size-exempt),
    input[type="reset"]:not(.touch-size-exempt) {
      min-height: 44px;
      min-width: 44px;
      padding: 0.5rem 1rem;
    }
    
    /* Touch spacing between interactive elements */
    .touch-spacing > * + * {
      margin-left: 8px;
    }
    
    .touch-spacing-vertical > * + * {
      margin-top: 8px;
    }
  }
  
  /* Specific sizing variants */
  @media (hover: none) {
    .touch-size-sm:not(.touch-size-exempt) {
      min-height: 36px;
      min-width: 36px;
      padding: 0.375rem 0.75rem;
    }
    
    .touch-size-lg:not(.touch-size-exempt) {
      min-height: 52px;
      min-width: 52px;
      padding: 0.625rem 1.25rem;
    }
    
    /* Icon-only buttons */
    .touch-icon-btn:not(.touch-size-exempt) {
      min-height: 44px;
      min-width: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 50%;
    }
    
    /* For debugging touch targets */
    .debug-touch-target::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 1px dashed red;
      pointer-events: none;
    }
  }
`;

// Classes to apply for proper button sizing on touch devices
export const touchButtonClasses = {
  default: "touch-device:min-h-[44px] touch-device:min-w-[44px] touch-device:px-4 touch-device:py-2",
  small: "touch-device:min-h-[36px] touch-device:min-w-[36px] touch-device:px-3 touch-device:py-1.5",
  large: "touch-device:min-h-[52px] touch-device:min-w-[52px] touch-device:px-5 touch-device:py-2.5",
  icon: "touch-device:min-h-[44px] touch-device:min-w-[44px] touch-device:p-2",
  exempt: "touch-size-exempt", // Add this to buttons that should keep their original size
};

// Helper function to pick appropriate size classes based on device
export const getButtonSizeClasses = (size: "default" | "small" | "large" | "icon" = "default") => {
  if (typeof window === "undefined") return "";
  
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!isTouch) return "";
  
  return touchButtonClasses[size];
};

// Apply proper spacing between buttons in a group
export const touchButtonGroupClasses = "touch-device:space-x-2 touch-device:space-y-0";
export const touchButtonStackClasses = "touch-device:space-x-0 touch-device:space-y-2"; 