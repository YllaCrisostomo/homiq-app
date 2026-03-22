/**
 * Reusable Card Component
 * 
 * Provides a consistent container with soft shadows and
 * rounded corners as seen in the Homiq design.
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
  onClick?: () => void;
}

export const Card = ({ className, padding = 'md', hoverable = false, children, ...props }: CardProps) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-[24px] border border-gray-100/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all',
        paddings[padding],
        hoverable && 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
