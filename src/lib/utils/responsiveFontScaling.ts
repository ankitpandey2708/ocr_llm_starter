/**
 * Responsive font scaling utilities
 * Ensures proper font scaling and consistent typography across device sizes
 */

// Responsive typography scale with fluid type sizes for different breakpoints
export const responsiveFontScale = {
  // Heading scales
  h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold",
  h2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold",
  h3: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold",
  h4: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold",
  h5: "text-base sm:text-lg md:text-xl lg:text-2xl font-medium",
  h6: "text-sm sm:text-base md:text-lg lg:text-xl font-medium",
  
  // Body text scales
  body: {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg md:text-lg",
    lg: "text-lg sm:text-xl md:text-xl lg:text-2xl",
    xl: "text-xl sm:text-2xl md:text-2xl lg:text-3xl",
  },
  
  // Label & UI text scales
  ui: {
    xs: "text-xs",
    sm: "text-xs sm:text-sm",
    base: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
  },
  
  // Special-case scales
  display: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight",
  caption: "text-xs sm:text-sm text-gray-500 dark:text-gray-400",
  overline: "text-xs uppercase tracking-widest font-medium",
  code: "font-mono text-sm sm:text-base",
};

// Line height utilities for different text sizes
export const lineHeights = {
  headings: "leading-tight",
  body: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

// Typographic utilities for text rendering
export const textRendering = {
  optimizeSpeed: "text-rendering-optimizeSpeed",  // Prioritize rendering speed
  optimizeLegibility: "text-rendering-optimizeLegibility",  // Prioritize legibility with proper kerning and ligatures
  geometricPrecision: "text-rendering-geometricPrecision",  // Prioritize geometric precision
};

// Font smoothing for better text rendering
export const fontSmoothing = {
  antialiased: "antialiased", // Smoother font on non-retina screens
  subpixelAntialiased: "subpixel-antialiased", // Default rendering
}; 