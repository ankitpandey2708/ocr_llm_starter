"use client";

import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  id: string | number;
  label: string;
  active?: boolean;
  completed?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onStepClick?: (id: string | number) => void;
  className?: string;
}

const Breadcrumbs = ({ 
  items, 
  onStepClick,
  className = "" 
}: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={16} className="mx-2 text-gray-400" aria-hidden="true" />
            )}
            
            <div 
              className={`flex items-center ${onStepClick ? 'cursor-pointer' : ''}`}
              onClick={() => onStepClick && onStepClick(item.id)}
            >
              <div 
                className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                  ${item.completed 
                    ? 'bg-success text-white' 
                    : item.active 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                aria-hidden="true"
              >
                {item.completed ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={`text-sm font-medium 
                  ${item.active 
                    ? 'text-primary' 
                    : item.completed 
                      ? 'text-success' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                {item.label}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 