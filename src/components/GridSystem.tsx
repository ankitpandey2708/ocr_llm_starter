"use client";

import { ReactNode, ElementType } from "react";

interface GridSystemProps {
  children: ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: "xs" | "sm" | "md" | "lg";
  rowGap?: "xs" | "sm" | "md" | "lg";
  columnGap?: "xs" | "sm" | "md" | "lg";
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyItems?: "start" | "center" | "end" | "stretch";
  className?: string;
  as?: ElementType;
}

/**
 * GridSystem component provides a flexible grid layout system with responsive columns
 * and consistent spacing aligned with the design system
 */
const GridSystem = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  rowGap,
  columnGap,
  alignItems = "start",
  justifyItems = "stretch",
  className = "",
  as: Component = "div",
}: GridSystemProps) => {
  // Convert columns prop to responsive grid template columns classes
  const getColumnsClasses = () => {
    if (typeof columns === "number") {
      return `grid-cols-${columns}`;
    }

    const breakpoints = ["sm", "md", "lg", "xl"] as const;
    return breakpoints
      .map(bp => columns[bp] ? `${bp}:grid-cols-${columns[bp]}` : "")
      .filter(Boolean)
      .join(" ");
  };

  // Gap classes based on responsive spacing
  const gapClasses = {
    xs: "gap-1 sm:gap-1.5 md:gap-2",
    sm: "gap-2 sm:gap-3 md:gap-4",
    md: "gap-4 sm:gap-5 md:gap-6 lg:gap-8",
    lg: "gap-6 sm:gap-8 md:gap-10 lg:gap-12",
  };

  // Row gap classes
  const rowGapClasses = rowGap
    ? {
        xs: "row-gap-1 sm:row-gap-1.5 md:row-gap-2",
        sm: "row-gap-2 sm:row-gap-3 md:row-gap-4",
        md: "row-gap-4 sm:row-gap-5 md:row-gap-6 lg:row-gap-8",
        lg: "row-gap-6 sm:row-gap-8 md:row-gap-10 lg:row-gap-12",
      }[rowGap]
    : "";

  // Column gap classes
  const columnGapClasses = columnGap
    ? {
        xs: "col-gap-1 sm:col-gap-1.5 md:col-gap-2",
        sm: "col-gap-2 sm:col-gap-3 md:col-gap-4",
        md: "col-gap-4 sm:col-gap-5 md:col-gap-6 lg:col-gap-8",
        lg: "col-gap-6 sm:col-gap-8 md:col-gap-10 lg:col-gap-12",
      }[columnGap]
    : "";

  // Alignment classes
  const alignItemsClass = `items-${alignItems}`;
  const justifyItemsClass = `justify-items-${justifyItems}`;

  return (
    <Component
      className={`grid ${getColumnsClasses()} ${
        !rowGap && !columnGap ? gapClasses[gap] : ""
      } ${rowGapClasses} ${columnGapClasses} ${alignItemsClass} ${justifyItemsClass} ${className}`}
    >
      {children}
    </Component>
  );
};

export default GridSystem; 