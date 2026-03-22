/**
 * Bottom Navigation Component
 * 
 * Provides primary navigation for mobile users with
 * clear icons and active state indicators.
 */

import React from 'react';
import { LayoutGrid, Package, ShoppingCart, CheckSquare, BarChart3, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: 'dashboard', label: 'HOME', icon: LayoutGrid },
    { id: 'inventory', label: 'STOCK', icon: Package },
    { id: 'grocery', label: 'SHOP', icon: ShoppingCart },
    { id: 'tasks', label: 'TASKS', icon: CheckSquare },
    { id: 'insights', label: 'INSIGHTS', icon: BarChart3 },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 pb-safe pt-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 py-2 px-3 rounded-2xl transition-all relative group',
                isActive ? 'text-[#0A192F]' : 'text-gray-300 hover:text-gray-400'
              )}
            >
              <div className={cn(
                'p-2 rounded-2xl transition-all',
                isActive ? 'bg-gray-100 scale-110' : 'bg-transparent'
              )}>
                <Icon className={cn('w-6 h-6', isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]')} />
              </div>
              <span className={cn(
                'text-[9px] font-black tracking-widest uppercase transition-all',
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0A192F] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
