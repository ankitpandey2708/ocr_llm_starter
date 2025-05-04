"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const HoverCard = ({ children, className = "", onClick }: HoverCardProps) => {
  return (
    <motion.div 
      className={`relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200
        hover:shadow-md dark:shadow-none dark:hover:shadow-none bg-subtle-pattern ${className}`}
      whileHover={{ 
        y: -4, 
        transition: { duration: 0.2 } 
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default HoverCard; 