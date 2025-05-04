/**
 * Utilities for responsive spacing adjustments on smaller screens
 * Ensures proper spacing across different screen sizes
 */

// Tailwind-based responsive spacing classes
// Use these for consistent spacing that adjusts to screen size
export const responsiveSpacing = {
  // Container margins
  container: {
    sm: "mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16",
    md: "mx-5 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20",
    lg: "mx-6 sm:mx-10 md:mx-16 lg:mx-20 xl:mx-24",
  },
  
  // Section padding
  section: {
    sm: "py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12",
    md: "py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20",
    lg: "py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24",
  },
  
  // Card padding
  card: {
    sm: "p-3 sm:p-4 md:p-5 lg:p-6",
    md: "p-4 sm:p-5 md:p-6 lg:p-8",
    lg: "p-5 sm:p-6 md:p-8 lg:p-10",
  },
  
  // Margins between elements stacked vertically
  stack: {
    xs: "space-y-1 sm:space-y-1.5 md:space-y-2",
    sm: "space-y-2 sm:space-y-3 md:space-y-4",
    md: "space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8",
    lg: "space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12",
  },
  
  // Margins between elements in a row
  row: {
    xs: "space-x-1 sm:space-x-1.5 md:space-x-2",
    sm: "space-x-2 sm:space-x-3 md:space-x-4",
    md: "space-x-4 sm:space-x-5 md:space-x-6 lg:space-x-8",
    lg: "space-x-6 sm:space-x-8 md:space-x-10 lg:space-x-12",
  },
  
  // Gaps for grid layouts
  grid: {
    xs: "gap-1 sm:gap-1.5 md:gap-2",
    sm: "gap-2 sm:gap-3 md:gap-4",
    md: "gap-4 sm:gap-5 md:gap-6 lg:gap-8",
    lg: "gap-6 sm:gap-8 md:gap-10 lg:gap-12",
  },
  
  // Component-specific margins
  component: {
    button: {
      sm: "m-1 sm:m-1.5 md:m-2",
      md: "m-2 sm:m-2.5 md:m-3",
      lg: "m-3 sm:m-4 md:m-5",
    },
    input: {
      standard: "mb-4 sm:mb-5 md:mb-6",
    },
    header: {
      standard: "mb-4 sm:mb-6 md:mb-8 lg:mb-10",
    },
    footer: {
      standard: "mt-8 sm:mt-12 md:mt-16 lg:mt-20",
    },
  },
};

// Function to generate responsive padding for different viewports
export const getResponsivePadding = (baseSize: number = 4) => {
  const sm = Math.max(Math.floor(baseSize * 0.75), 2);
  const lg = baseSize * 1.25;
  const xl = baseSize * 1.5;
  
  return {
    xs: sm,
    sm: baseSize,
    md: lg,
    lg: xl,
  };
};

// Function to generate CSS custom properties for responsive spacing
export const getResponsiveSpacingCSS = () => {
  return `
    :root {
      --spacing-xs: 0.25rem;
      --spacing-sm: 0.5rem;
      --spacing-md: 1rem;
      --spacing-lg: 1.5rem;
      --spacing-xl: 2rem;
      --spacing-2xl: 3rem;
      
      --container-padding: 1rem;
      --section-spacing: 2rem;
      --component-spacing: 1rem;
    }
    
    @media (min-width: 640px) {
      :root {
        --spacing-xs: 0.375rem;
        --spacing-sm: 0.75rem;
        --spacing-md: 1.25rem;
        --spacing-lg: 1.75rem;
        --spacing-xl: 2.5rem;
        --spacing-2xl: 3.5rem;
        
        --container-padding: 1.5rem;
        --section-spacing: 2.5rem;
        --component-spacing: 1.25rem;
      }
    }
    
    @media (min-width: 768px) {
      :root {
        --spacing-xs: 0.5rem;
        --spacing-sm: 1rem;
        --spacing-md: 1.5rem;
        --spacing-lg: 2rem;
        --spacing-xl: 3rem;
        --spacing-2xl: 4rem;
        
        --container-padding: 2rem;
        --section-spacing: 3rem;
        --component-spacing: 1.5rem;
      }
    }
    
    @media (min-width: 1024px) {
      :root {
        --spacing-xs: 0.5rem;
        --spacing-sm: 1rem;
        --spacing-md: 1.75rem;
        --spacing-lg: 2.5rem;
        --spacing-xl: 3.5rem;
        --spacing-2xl: 5rem;
        
        --container-padding: 3rem;
        --section-spacing: 4rem;
        --component-spacing: 2rem;
      }
    }
  `;
}; 