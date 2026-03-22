/**
 * Source Stores Management Page
 * 
 * Manages the list of stores where household
 * items are typically purchased.
 */

import React from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MasterDataItem } from '../../types';

interface StoresProps {
  onBack: () => void;
}

export default function Stores({ onBack }: StoresProps) {
  const { state, updateMasterData, deleteMasterData } = useAppState();

  const stores = state.masterData.filter(m => m.type === 'SourceStore');

  const handleAdd = () => {
    const name = prompt('Enter store name:');
    if (!name) return;
    
    const newItem: MasterDataItem = {
      id: `store-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'SourceStore'
    };
    updateMasterData(newItem);
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
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tight">Source Stores</h2>
          <p className="text-gray-400 font-medium tracking-tight">Manage your sourcestore data</p>
        </div>
        <Button onClick={handleAdd} className="rounded-2xl px-6">
          <Plus className="w-5 h-5 mr-2" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {stores.map(store => (
          <Card key={store.id} padding="sm" className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <input 
                type="text" 
                value={store.name}
                onChange={(e) => updateMasterData({ ...store, name: e.target.value })}
                className="flex-1 bg-transparent font-bold text-[#0A192F] focus:outline-none"
              />
            </div>
            <button 
              onClick={() => deleteMasterData(store.id)}
              className="p-4 text-gray-200 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
