/**
 * Task Categories Management Page
 * 
 * Handles hierarchical task-specific categories
 * with nested sub-categories.
 */

import React from 'react';
import { ChevronLeft, Plus, Trash2, PlusCircle } from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MasterDataItem } from '../../types';

interface TaskCategoriesProps {
  onBack: () => void;
}

export default function TaskCategories({ onBack }: TaskCategoriesProps) {
  const { state, updateMasterData, deleteMasterData } = useAppState();

  const categories = state.masterData.filter(m => m.type === 'TaskCategory');
  const rootCategories = categories.filter(c => !c.parentId);

  const handleAdd = (parentId?: string) => {
    const name = prompt('Enter task category name:');
    if (!name) return;
    
    const newItem: MasterDataItem = {
      id: `tcat-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'TaskCategory',
      parentId
    };
    updateMasterData(newItem);
  };

  const renderCategory = (cat: MasterDataItem) => {
    const children = categories.filter(c => c.parentId === cat.id);
    
    return (
      <div key={cat.id} className="space-y-4">
        <div className="flex items-center gap-3 group">
          <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <input 
              type="text" 
              value={cat.name}
              onChange={(e) => updateMasterData({ ...cat, name: e.target.value })}
              className="flex-1 bg-transparent font-bold text-[#0A192F] focus:outline-none"
            />
            <button 
              onClick={() => deleteMasterData(cat.id)}
              className="p-2 text-gray-200 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="ml-6 space-y-4 border-l-2 border-gray-50 pl-6">
          {children.map(child => renderCategory(child))}
          <button 
            onClick={() => handleAdd(cat.id)}
            className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-widest hover:text-teal-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Sub-category
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 font-bold hover:text-[#0A192F] transition-colors mb-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tight">Task Categories</h2>
          <p className="text-gray-400 font-medium tracking-tight">Manage your taskcategory data</p>
        </div>
        <Button onClick={() => handleAdd()} className="rounded-2xl px-6">
          <Plus className="w-5 h-5 mr-2" />
          Add
        </Button>
      </div>

      <Card className="space-y-8">
        {rootCategories.map(cat => renderCategory(cat))}
      </Card>
    </div>
  );
}
