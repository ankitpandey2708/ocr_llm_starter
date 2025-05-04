"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/shared";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "primary" | "success" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white shadow-sm":
              variant === "default",
              
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/25 hover:translate-y-[-1px]":
              variant === "primary",
              
            "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/25 hover:translate-y-[-1px]":
              variant === "success",
              
            "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/25 hover:translate-y-[-1px]":
              variant === "danger",
              
            "border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50 text-slate-900 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white shadow-sm":
              variant === "outline",
              
            "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100":
              variant === "ghost",
              
            "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline":
              variant === "link",
              
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-9 px-3 text-xs rounded-md": size === "sm",
            "h-11 px-6 text-base": size === "lg",
            "h-10 w-10 p-0 rounded-full": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button }; 