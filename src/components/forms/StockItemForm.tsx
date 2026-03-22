/**
 * Stock Item Form Component
 * 
 * Handles adding and updating inventory items with
 * comprehensive fields for SKU, stock levels, and variations.
 */

import React, { useState, useEffect } from 'react';
import { InventoryItem, MasterDataItem } from '../../types';
import { Button } from '../ui/Button';

interface StockItemFormProps {
  initialData?: Partial<InventoryItem>;
  onSubmit: (data: Partial<InventoryItem>) => void;
  masterData: MasterDataItem[];
  inventory: InventoryItem[];
}

export const StockItemForm = ({ initialData, onSubmit, masterData, inventory }: StockItemFormProps) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    description: '',
    categoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
    locationId: '',
    subLocationId: '',
    subSubLocationId: '',
    stockAmount: 0,
    stockUOM: '',
    actualAmount: 0,
    actualUOM: '',
    expiryDate: '',
    minStockThreshold: 0,
    brand: '',
    size: '',
    color: '',
    material: '',
    costPrice: 0,
    alternativeItemId: '',
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = masterData.filter(m => m.type === 'Category' && !m.parentId);
  const subCategories = masterData.filter(m => m.type === 'Category' && m.parentId === formData.categoryId);
  const subSubCategories = masterData.filter(m => m.type === 'Category' && m.parentId === formData.subCategoryId);
  
  const locations = masterData.filter(m => m.type === 'Location' && !m.parentId);
  const subLocations = masterData.filter(m => m.type === 'Location' && m.parentId === formData.locationId);
  const subSubLocations = masterData.filter(m => m.type === 'Location' && m.parentId === formData.subLocationId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* STOCK ITEM INFORMATION */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Stock Item Information
        </h4>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Name *</label>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            placeholder="Enter product name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU Code</label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status (Auto)</label>
            <div className="w-full p-4 bg-gray-100 rounded-2xl font-bold text-gray-500">
              {formData.status || 'New Item'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Category</label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {subCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Sub-Category</label>
            <select
              name="subSubCategoryId"
              value={formData.subSubCategoryId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {subSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Location</label>
            <select
              name="subLocationId"
              value={formData.subLocationId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {subLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Sub-Location</label>
            <select
              name="subSubLocationId"
              value={formData.subSubLocationId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {subSubLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Store</label>
            <select
              name="sourceStoreId"
              value={formData.sourceStoreId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {masterData.filter(m => m.type === 'SourceStore' && !m.parentId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Store</label>
            <select
              name="subSourceStoreId"
              value={formData.subSourceStoreId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {masterData.filter(m => m.type === 'SourceStore' && m.parentId === formData.sourceStoreId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Sub-Store</label>
            <select
              name="subSubSourceStoreId"
              value={formData.subSubSourceStoreId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {masterData.filter(m => m.type === 'SourceStore' && m.parentId === formData.subSourceStoreId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Amount</label>
            <input
              type="number"
              name="stockAmount"
              value={formData.stockAmount}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock UOM</label>
            <input
              name="stockUOM"
              value={formData.stockUOM}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
              placeholder="e.g. L, kg, pcs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actual Amount</label>
            <input
              type="number"
              name="actualAmount"
              value={formData.actualAmount}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actual UOM</label>
            <input
              name="actualUOM"
              value={formData.actualUOM}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
              placeholder="e.g. L, kg, pcs"
            />
          </div>
        </div>
      </section>

      {/* STOCK MANAGEMENT */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Stock Management
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min Stock Threshold</label>
            <input
              type="number"
              name="minStockThreshold"
              value={formData.minStockThreshold}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
        </div>
      </section>

      {/* VARIATION */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Variation
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand</label>
            <input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</label>
            <input
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color</label>
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</label>
            <input
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost Price</label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alternative Item To</label>
            <select
              name="alternativeItemId"
              value={formData.alternativeItemId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {inventory
                .filter(item => item.id !== initialData?.id)
                .map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </section>

      <Button type="submit" className="w-full py-6 rounded-2xl bg-[#0A192F] text-white hover:bg-[#1A293F]">
        {initialData?.id ? 'Update Item' : 'Save Item'}
      </Button>
    </form>
  );
};
