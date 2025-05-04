"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TransitionWrapperProps {
  children: ReactNode;
  isVisible: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  type?: "fade" | "slide" | "scale" | "slideUp";
}

const TransitionWrapper = ({
  children,
  isVisible,
  duration = 0.3,
  delay = 0,
  className = "",
  type = "fade",
}: TransitionWrapperProps) => {
  // Different animation variants
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 },
    },
    slideUp: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
    },
    scale: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
    },
  };

  const selectedVariant = variants[type];

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={selectedVariant}
          transition={{ 
            duration, 
            delay,
            ease: "easeInOut" 
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransitionWrapper; 