/**
 * Inventory Page
 * 
 * Manages the household stock with SKU tracking,
 * status indicators, and visual stock levels.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, MoreVertical, Package, Edit2, Trash2, AlertCircle, Clock, CheckCircle2, PackageX } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { StockItemForm } from '../components/forms/StockItemForm';
import { InventoryItem } from '../types';

export default function Inventory() {
  const { state, addInventoryItem, updateInventoryItem, deleteInventoryItem, calculateItemStatus } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: Partial<InventoryItem>) => {
    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        ...data,
        lastUpdated: new Date().toISOString(),
      } as InventoryItem;
      updateInventoryItem(updatedItem);
    } else {
      const newItem = {
        ...data,
        id: `inv-${Math.random().toString(36).substr(2, 9)}`,
        lastStockedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      } as Omit<InventoryItem, 'sku' | 'status'>;
      addInventoryItem(newItem);
    }
    setIsModalOpen(false);
  };

  const getStatusVariant = (status: InventoryItem['status']): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'Available': return 'success';
      case 'Low Stock': return 'warning';
      case 'No Stock': return 'danger';
      case 'Near Expiry': return 'warning';
      case 'Expired': return 'danger';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'Available': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Low Stock': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'No Stock': return <PackageX className="w-4 h-4 text-red-500" />;
      case 'Near Expiry': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'Expired': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const sortedItems = useMemo(() => {
    const filtered = state.inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort by category name
    return [...filtered].sort((a, b) => {
      const catA = state.masterData.find(m => m.id === a.categoryId)?.name || '';
      const catB = state.masterData.find(m => m.id === b.categoryId)?.name || '';
      return catA.localeCompare(catB);
    });
  }, [state.inventory, searchQuery, state.masterData]);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getMasterDataName = (id?: string) => {
    return state.masterData.find(m => m.id === id)?.name || '';
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-[#0A192F] tracking-tight">Inventory</h2>
        <Button onClick={handleAddItem} className="rounded-2xl px-6 bg-[#0A192F] text-white hover:bg-[#1A293F]">
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search SKU or Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-[#0A192F]"
        />
      </div>

      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {sortedItems.length} ITEMS SORTED BY CATEGORY
      </p>

      {/* Item List */}
      <div className="space-y-4">
        {sortedItems.length > 0 ? sortedItems.map(item => {
          const alternatives = state.inventory.filter(i => i.alternativeItemId === item.id);
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div key={item.id} className="space-y-2">
              <Card 
                className="space-y-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">SKU-{item.sku}</span>
                      <Badge variant={getStatusVariant(item.status)} className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </Badge>
                      {item.alternativeItemId && (
                        <Badge variant="info" className="bg-blue-50 text-blue-600">ALTERNATIVE</Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-[#0A192F] tracking-tight">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                      className="text-gray-300 hover:text-teal-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); deleteInventoryItem(item.id); }}
                      className="text-gray-300 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Category / Sub / Sub-Sub</p>
                    <p className="text-xs font-black text-[#0A192F] uppercase tracking-tight mt-1">
                      {getMasterDataName(item.categoryId)}
                      {item.subCategoryId && ` / ${getMasterDataName(item.subCategoryId)}`}
                      {item.subSubCategoryId && ` / ${getMasterDataName(item.subSubCategoryId)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Brand / Size</p>
                    <p className="text-xs font-black text-[#0A192F] uppercase tracking-tight mt-1">
                      {item.brand} / {item.size}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Location / Sub / Sub-Sub</p>
                    <p className="text-xs font-black text-[#0A192F] uppercase tracking-tight mt-1">
                      {getMasterDataName(item.locationId)}
                      {item.subLocationId && ` / ${getMasterDataName(item.subLocationId)}`}
                      {item.subSubLocationId && ` / ${getMasterDataName(item.subSubLocationId)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Source Store / Sub / Sub-Sub</p>
                    <p className="text-xs font-black text-[#0A192F] uppercase tracking-tight mt-1">
                      {getMasterDataName(item.sourceStoreId)}
                      {item.subSourceStoreId && ` / ${getMasterDataName(item.subSourceStoreId)}`}
                      {item.subSubSourceStoreId && ` / ${getMasterDataName(item.subSubSourceStoreId)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Stock Level</p>
                    <p className="text-xs font-black text-[#0A192F] uppercase tracking-tight mt-1">
                      {item.actualAmount} / {item.stockAmount} {item.stockUOM}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <ProgressBar 
                    value={item.actualAmount} 
                    max={item.stockAmount} 
                    variant={getStatusVariant(item.status)} 
                  />
                </div>
              </Card>

              {/* Alternatives Section */}
              {isExpanded && alternatives.length > 0 && (
                <div className="ml-8 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Alternative Items</p>
                  {alternatives.map(alt => (
                    <Card key={alt.id} className="bg-gray-50/50 border-dashed border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="info" className="bg-blue-50 text-blue-600">ALT</Badge>
                          <div>
                            <p className="text-sm font-black text-[#0A192F]">{alt.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU-{alt.sku} • {alt.brand}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(alt.status)} size="xs">{alt.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold">No items found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
      >
        <StockItemForm
          initialData={editingItem || {}}
          masterData={state.masterData}
          inventory={state.inventory}
          onSubmit={handleFormSubmit}
        />
      </Modal>
    </div>
  );
}
