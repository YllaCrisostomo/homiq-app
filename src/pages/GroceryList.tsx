/**
 * Grocery List Page (Shop)
 * 
 * Manages the shopping list with budget tracking,
 * item synchronization, and checkout functionality.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, ShoppingCart, DollarSign, Check, Edit2, Trash2 } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { ShopItemForm } from '../components/forms/ShopItemForm';
import { GroceryItem } from '../types';

export default function GroceryList() {
  const { state, addGroceryItem, updateGroceryItem, deleteGroceryItem, syncGroceryList, checkoutItems } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);

  const groupedItems = useMemo(() => {
    const filtered = state.groceryList.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const groups: { [key: string]: GroceryItem[] } = {};
    filtered.forEach(item => {
      const storeName = state.masterData.find(m => m.id === item.sourceStoreId)?.name || 'ANY STORE';
      if (!groups[storeName]) groups[storeName] = [];
      groups[storeName].push(item);
    });
    return groups;
  }, [state.groceryList, searchQuery, state.masterData]);

  const estTotal = state.groceryList.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0);
  const actualTotal = state.groceryList.reduce((sum, item) => sum + ((item.actualPrice || item.estimatedPrice) * item.quantity), 0);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: GroceryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: Partial<GroceryItem>) => {
    if (editingItem) {
      updateGroceryItem({ ...editingItem, ...data } as GroceryItem);
    } else {
      const newItem = {
        ...data,
        id: `groc-${Math.random().toString(36).substr(2, 9)}`,
        isPurchased: false,
      } as GroceryItem;
      addGroceryItem(newItem);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-[#0A192F] tracking-tight">Shop</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncGroceryList} className="rounded-2xl px-4 border-gray-100 shadow-sm">
            <RefreshCw className="w-5 h-5 mr-2" />
            Sync
          </Button>
          <Button onClick={handleAddItem} className="rounded-2xl px-6 bg-[#0A192F] text-white hover:bg-[#1A293F]">
            <Plus className="w-5 h-5 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Budget Card */}
      <Card className="space-y-6 bg-white border-none shadow-sm p-6 rounded-[32px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ESTIMATED VS ACTUAL</p>
            <h3 className="text-3xl font-black text-[#0A192F] tracking-tight">
              {state.household?.currencyCode || 'PHP'} {estTotal.toLocaleString()} / {actualTotal.toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-[#0A192F]"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {state.groceryList.length} ITEMS SORTED BY STORE
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => checkoutItems(selectedItems)}
            className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 disabled:opacity-50"
            disabled={selectedItems.length === 0}
          >
            CHECKOUT SELECTED
          </button>
          <button 
            onClick={() => checkoutItems(state.groceryList.map(i => i.id))}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0A192F]"
          >
            CHECKOUT ALL
          </button>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-8">
        {Object.keys(groupedItems).length > 0 ? (Object.entries(groupedItems) as [string, GroceryItem[]][]).map(([storeName, items]) => (
          <div key={storeName} className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">{storeName}</h4>
            <div className="space-y-4">
              {items.map(item => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <Card 
                    key={item.id} 
                    className={`space-y-6 bg-white border-none shadow-sm p-6 rounded-[32px] transition-all duration-300 ${
                      isSelected ? 'grayscale opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => toggleSelect(item.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-1 ${
                          isSelected 
                            ? 'bg-teal-500 border-teal-500 text-white' 
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3px]" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.sku || 'SKU-XXXX'}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)} className="text-gray-300 hover:text-teal-600">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteGroceryItem(item.id)} className="text-gray-300 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <h3 className="text-xl font-black text-[#0A192F] tracking-tight truncate">{item.name}</h3>
                          <p className="text-lg font-black text-teal-600 tracking-tight">
                            {state.household?.currencyCode || 'PHP'} {((item.actualPrice || item.estimatedPrice) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Category / Sub / Sub-Sub</p>
                            <p className="text-[10px] font-black text-[#0A192F] uppercase tracking-tight mt-1 truncate">
                              {state.masterData.find(m => m.id === item.categoryId)?.name || 'KITCHEN'}
                              {item.subCategoryId && ` / ${state.masterData.find(m => m.id === item.subCategoryId)?.name}`}
                              {item.subSubCategoryId && ` / ${state.masterData.find(m => m.id === item.subSubCategoryId)?.name}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Qty / Brand</p>
                            <p className="text-[10px] font-black text-[#0A192F] uppercase tracking-tight mt-1 truncate">
                              {item.quantity}x / {item.brand || 'ANY'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Store / Sub / Sub-Sub</p>
                            <p className="text-[10px] font-black text-[#0A192F] uppercase tracking-tight mt-1 truncate">
                              {state.masterData.find(m => m.id === item.sourceStoreId)?.name || 'ANY'}
                              {item.subSourceStoreId && ` / ${state.masterData.find(m => m.id === item.subSourceStoreId)?.name}`}
                              {item.subSubSourceStoreId && ` / ${state.masterData.find(m => m.id === item.subSubSourceStoreId)?.name}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Location / Sub / Sub-Sub</p>
                            <p className="text-[10px] font-black text-[#0A192F] uppercase tracking-tight mt-1 truncate">
                              {state.masterData.find(m => m.id === item.locationId)?.name || 'PANTRY'}
                              {item.subLocationId && ` / ${state.masterData.find(m => m.id === item.subLocationId)?.name}`}
                              {item.subSubLocationId && ` / ${state.masterData.find(m => m.id === item.subSubLocationId)?.name}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <Badge variant={item.inventoryItemId ? "info" : "neutral"}>
                            {item.inventoryItemId ? "LINKED" : "UNLINKED"}
                          </Badge>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-xl px-6 bg-[#00695C] text-white hover:bg-[#004D40]"
                            onClick={() => checkoutItems([item.id])}
                          >
                            Checkout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-300">Your list is empty</h3>
            <p className="text-gray-400 font-bold">Sync to pull low stock items</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Shop Item' : 'Add New Shop Item'}
      >
        <ShopItemForm
          initialData={editingItem || {}}
          masterData={state.masterData}
          inventory={state.inventory}
          onSubmit={handleFormSubmit}
        />
      </Modal>
    </div>
  );
}
