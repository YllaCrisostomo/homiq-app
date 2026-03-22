/**
 * Reusable Badge Component
 * 
 * Displays status labels and categories with specific
 * background and text colors.
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'xs' | 'sm';
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export const Badge = ({ className, variant = 'neutral', size = 'xs', children, ...props }: BadgeProps) => {
  const variants = {
    success: 'bg-[#E8F5E9] text-[#2E7D32]',
    warning: 'bg-[#FFF3E0] text-[#E65100]',
    danger: 'bg-[#FFEBEE] text-[#C62828]',
    info: 'bg-[#E3F2FD] text-[#1565C0]',
    neutral: 'bg-gray-100 text-gray-600',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
    sm: 'px-3 py-1 text-xs font-bold uppercase tracking-wider',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
