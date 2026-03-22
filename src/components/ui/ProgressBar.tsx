/**
 * Reusable ProgressBar Component
 * 
 * Displays stock levels and budget progress with
 * color-coded indicators.
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  showLabels?: boolean;
  labelLeft?: string;
  labelRight?: string;
}

export const ProgressBar = ({ 
  value, 
  max, 
  variant = 'success', 
  className,
  showLabels = false,
  labelLeft,
  labelRight
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variants = {
    success: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#EF4444]',
    info: 'bg-[#3B82F6]',
    neutral: 'bg-gray-400',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn('h-full transition-all duration-500 ease-out rounded-full', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labelLeft}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labelRight}</span>
        </div>
      )}
    </div>
  );
};
