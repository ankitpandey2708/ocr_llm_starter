"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  progress?: number; // 0-100
  isIndeterminate?: boolean;
  className?: string;
  color?: "primary" | "success" | "error" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  labelText?: string;
}

/**
 * ProgressIndicator component shows progress during operations like PDF generation
 * Can be determinate (with specific progress percentage) or indeterminate
 */
const ProgressIndicator = ({
  progress = 0,
  isIndeterminate = false,
  className = "",
  color = "primary",
  size = "md",
  showPercentage = true,
  labelText,
}: ProgressIndicatorProps) => {
  const [progressValue, setProgressValue] = useState(progress);

  // Update progress value with animation effect
  useEffect(() => {
    setProgressValue(progress);
  }, [progress]);

  // Size classes
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  // Color classes
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    error: "bg-error",
    warning: "bg-warning",
    info: "bg-info",
  };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(labelText || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {labelText && <span>{labelText}</span>}
          {showPercentage && !isIndeterminate && (
            <span className="font-medium">{Math.round(progressValue)}%</span>
          )}
        </div>
      )}
      
      <div 
        className={`w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${sizeClasses[size]}`}
      >
        {isIndeterminate ? (
          <motion.div
            className={`h-full rounded-full ${colorClasses[color]}`}
            initial={{ x: "-100%" }}
            animate={{ 
              x: "100%",
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "linear"
            }}
            style={{ width: "50%" }}
          />
        ) : (
          <motion.div
            className={`h-full rounded-full ${colorClasses[color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator; 