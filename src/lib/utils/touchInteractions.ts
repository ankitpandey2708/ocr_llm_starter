/**
 * Utility functions for mobile-specific touch interactions
 */

// Simple touch detection for conditionally rendering components
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Enhances click targets for touch devices by expanding hit areas
export const getTouchTargetEnhancementStyles = (
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
  const sizes = {
    sm: 8, // 8px expansion
    md: 12, // 12px expansion
    lg: 16, // 16px expansion
  };

  const expansion = sizes[size];

  return {
    position: 'relative' as const,
    // Use pseudo-element to create an invisible larger hit area
    '::after': {
      content: '""',
      position: 'absolute' as const,
      top: `-${expansion}px`,
      right: `-${expansion}px`,
      bottom: `-${expansion}px`,
      left: `-${expansion}px`,
      zIndex: 1,
    },
  };
};

// Tailwind classes for touch enhancements
export const touchTargetClasses = {
  sm: 'relative touch-target-sm',
  md: 'relative touch-target-md',
  lg: 'relative touch-target-lg',
};

// Handles the issue with :hover states on touch devices
export const touchHoverClasses = 'hover:lg:bg-gray-100 active:bg-gray-100 dark:hover:lg:bg-gray-800 dark:active:bg-gray-800';

// Helper to distinguish between mouse and touch events
export const useTouchStateClasses = (baseClasses: string) => {
  return `${baseClasses} ${isTouchDevice() ? 'touch-device' : 'mouse-device'}`;
};

// Convert touch events to appropriate mouse events for unified handling
export const normalizeEvent = (event: React.TouchEvent | React.MouseEvent) => {
  if ('touches' in event) {
    // Touch event
    const touch = event.touches[0] || event.changedTouches[0];
    return {
      clientX: touch?.clientX || 0,
      clientY: touch?.clientY || 0,
      pageX: touch?.pageX || 0,
      pageY: touch?.pageY || 0,
      isTouch: true,
    };
  }
  
  // Mouse event
  return {
    clientX: event.clientX,
    clientY: event.clientY,
    pageX: event.pageX,
    pageY: event.pageY,
    isTouch: false,
  };
};

// CSS to inject for proper touch handling
export const touchCss = `
  /* Expanded touch targets */
  .touch-target-sm::after {
    content: "";
    position: absolute;
    top: -8px;
    right: -8px;
    bottom: -8px;
    left: -8px;
    z-index: 1;
  }
  
  .touch-target-md::after {
    content: "";
    position: absolute;
    top: -12px;
    right: -12px;
    bottom: -12px;
    left: -12px;
    z-index: 1;
  }
  
  .touch-target-lg::after {
    content: "";
    position: absolute;
    top: -16px;
    right: -16px;
    bottom: -16px;
    left: -16px;
    z-index: 1;
  }
  
  /* Disable hover effects on touch devices */
  @media (hover: none) {
    .hover\\:bg-gray-100:hover {
      background-color: inherit;
    }
    
    .dark .dark\\:hover\\:bg-gray-800:hover {
      background-color: inherit;
    }
  }
  
  /* Ensure proper button sizing on touch devices */
  @media (hover: none) {
    button, 
    .button,
    [role="button"] {
      min-height: 44px;
      min-width: 44px;
    }
  }
`; 