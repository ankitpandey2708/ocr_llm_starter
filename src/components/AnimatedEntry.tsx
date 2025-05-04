"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type AnimationDirection = "up" | "down" | "left" | "right" | "scale" | "fade";

interface AnimatedEntryProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: AnimationDirection;
  distance?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  repeat?: boolean;
  repeatType?: "loop" | "reverse" | "mirror";
}

/**
 * AnimatedEntry provides subtle animations for component entry/exit
 * Use this to animate components when they first appear on the page
 */
const AnimatedEntry = ({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  direction = "up",
  distance = 20,
  staggerChildren = false,
  staggerDelay = 0.1,
  repeat = false,
  repeatType = "reverse",
}: AnimatedEntryProps) => {
  // Base animation variants
  const getVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { y: distance, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        };
      case "down":
        return {
          hidden: { y: -distance, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        };
      case "left":
        return {
          hidden: { x: distance, opacity: 0 },
          visible: { x: 0, opacity: 1 },
        };
      case "right":
        return {
          hidden: { x: -distance, opacity: 0 },
          visible: { x: 0, opacity: 1 },
        };
      case "scale":
        return {
          hidden: { scale: 0.8, opacity: 0 },
          visible: { scale: 1, opacity: 1 },
        };
      case "fade":
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  // Animation configuration
  const variants = {
    hidden: getVariants().hidden,
    visible: {
      ...getVariants().visible,
      transition: {
        duration,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: staggerChildren ? staggerDelay : 0,
      },
    },
  };

  // Child animation for staggered effects
  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      {...(repeat ? { 
        repeat: Infinity, 
        repeatType: repeatType 
      } : {})}
    >
      {staggerChildren ? (
        <>
          {Array.isArray(children)
            ? children.map((child, index) => (
                <motion.div key={index} variants={childVariants}>
                  {child}
                </motion.div>
              ))
            : (
                <motion.div variants={childVariants}>
                  {children}
                </motion.div>
              )
          }
        </>
      ) : (
        children
      )}
    </motion.div>
  );
};

export default AnimatedEntry; 