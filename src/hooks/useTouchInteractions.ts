"use client";

import { useEffect, useState, useCallback } from "react";
import { isTouchDevice } from "../lib/utils/touchInteractions";

interface TouchOptions {
  enableTapHighlight?: boolean;
  enableDoubleTapZoom?: boolean;
  preventOverscroll?: boolean;
  preventZoom?: boolean;
}

// Add type declaration for webkit-specific CSS properties
declare global {
  interface CSSStyleDeclaration {
    webkitTapHighlightColor: string;
  }
}

/**
 * Hook for implementing mobile-specific touch interactions
 * Helps optimize the UX for touch devices with proper handling of gestures
 */
export const useTouchInteractions = (options: TouchOptions = {}) => {
  const {
    enableTapHighlight = false,
    enableDoubleTapZoom = false,
    preventOverscroll = true,
    preventZoom = false,
  } = options;

  const [isTouch, setIsTouch] = useState(false);

  // Detect touch on mount
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // Handle tap highlight
  useEffect(() => {
    if (!isTouch) return;

    const originalTapHighlight = document.documentElement.style.webkitTapHighlightColor;
    
    if (!enableTapHighlight) {
      document.documentElement.style.webkitTapHighlightColor = "transparent";
    }

    return () => {
      document.documentElement.style.webkitTapHighlightColor = originalTapHighlight;
    };
  }, [isTouch, enableTapHighlight]);

  // Prevent overscroll/bounce
  useEffect(() => {
    if (!isTouch || !preventOverscroll) return;

    const handleTouchMove = (e: TouchEvent) => {
      // Don't prevent default for specific elements that should scroll
      const target = e.target as HTMLElement;
      const isScrollable = 
        target.closest('[data-scrollable="true"]') ||
        target.classList.contains('scrollable');
      
      if (isScrollable) return;
      
      e.preventDefault();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isTouch, preventOverscroll]);

  // Prevent pinch zoom
  useEffect(() => {
    if (!isTouch || !preventZoom) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isTouch, preventZoom]);

  // Prevent double-tap zoom
  useEffect(() => {
    if (!isTouch || enableDoubleTapZoom) return;

    let lastTap = 0;
    
    const handleTouchEnd = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
      }
      
      lastTap = currentTime;
    };

    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouch, enableDoubleTapZoom]);

  // Provide swipe detection
  const handleSwipe = useCallback((
    element: HTMLElement, 
    onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void
  ) => {
    if (!isTouch) return () => {};
    
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Require a minimum swipe distance (30px)
      if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        onSwipe(diffX > 0 ? 'left' : 'right');
      } else {
        // Vertical swipe
        onSwipe(diffY > 0 ? 'up' : 'down');
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouch]);

  return {
    isTouch,
    handleSwipe,
    touchProps: {
      role: "button",
      tabIndex: 0,
      className: isTouch ? "touch-optimized" : "",
    },
  };
}; 