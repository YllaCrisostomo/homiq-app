/**
 * App Header Component
 * 
 * Displays the Homiq logo, household name, and user profile
 * as seen in the top section of the design.
 */

import React from 'react';
import { useAppState } from '../../hooks/useAppState';

export const Header = () => {
  const { state } = useAppState();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0A192F] rounded-xl flex items-center justify-center shadow-lg shadow-[#0A192F]/20">
            <span className="text-white font-black text-xl">H</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-[#0A192F] leading-none tracking-tight">Homiq</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              {state.household?.name || 'Tinamisan'} Household
            </p>
          </div>
        </div>
        
        <div className="relative">
          <img 
            src={state.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alessandra'} 
            alt="User Profile" 
            className="w-10 h-10 rounded-2xl bg-gray-100 border-2 border-white shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        </div>
      </div>
    </header>
  );
};
