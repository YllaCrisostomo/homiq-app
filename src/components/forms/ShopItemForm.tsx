/**
 * Shop Item Form Component
 * 
 * Handles adding and updating grocery list items with
 * fields for quantity, estimated price, and store source.
 */

import React, { useState } from 'react';
import { GroceryItem, MasterDataItem, InventoryItem } from '../../types';
import { Button } from '../ui/Button';

interface ShopItemFormProps {
  initialData?: Partial<GroceryItem>;
  onSubmit: (data: Partial<GroceryItem>) => void;
  masterData: MasterDataItem[];
  inventory: InventoryItem[];
}

export const ShopItemForm = ({ initialData, onSubmit, masterData, inventory }: ShopItemFormProps) => {
  const [formData, setFormData] = useState<Partial<GroceryItem>>({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
    locationId: '',
    subLocationId: '',
    subSubLocationId: '',
    sourceStoreId: '',
    subSourceStoreId: '',
    subSubSourceStoreId: '',
    quantity: 1,
    estimatedPrice: 0,
    actualPrice: 0,
    isNotAvailable: false,
    brand: '',
    size: '',
    variant: '',
    inventoryItemId: '',
    alternativeItemId: '',
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) || 0 : value);
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      
      // If inventory item is selected, auto-fill some fields
      if (name === 'inventoryItemId' && value) {
        const item = inventory.find(i => i.id === value);
        if (item) {
          updated.name = item.name;
          updated.sku = item.sku;
          updated.categoryId = item.categoryId;
          updated.subCategoryId = item.subCategoryId;
          updated.subSubCategoryId = item.subSubCategoryId;
          updated.locationId = item.locationId;
          updated.subLocationId = item.subLocationId;
          updated.subSubLocationId = item.subSubLocationId;
          updated.brand = item.brand;
          updated.size = item.size;
          updated.estimatedPrice = item.costPrice;
          updated.sourceStoreId = item.sourceStoreId;
          updated.subSourceStoreId = item.subSourceStoreId;
          updated.subSubSourceStoreId = item.subSubSourceStoreId;
        }
      }
      
      return updated;
    });
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

  const stores = masterData.filter(m => m.type === 'SourceStore' && !m.parentId);
  const subStores = masterData.filter(m => m.type === 'SourceStore' && m.parentId === formData.sourceStoreId);
  const subSubStores = masterData.filter(m => m.type === 'SourceStore' && m.parentId === formData.subSourceStoreId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* PRODUCT INFORMATION */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Product Information
        </h4>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link to Inventory Item</label>
          <select
            name="inventoryItemId"
            value={formData.inventoryItemId}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
          >
            <option value="">New Item (Not in Inventory)</option>
            {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
          </select>
        </div>

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
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
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
      </section>

      {/* PRICING & SOURCE */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Pricing & Source
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Price</label>
            <input
              type="number"
              name="estimatedPrice"
              value={formData.estimatedPrice}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actual Price</label>
            <input
              type="number"
              name="actualPrice"
              value={formData.actualPrice}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Store</label>
            <select
              name="sourceStoreId"
              value={formData.sourceStoreId}
              onChange={handleChange}
              disabled={!!formData.inventoryItemId}
              className={`w-full p-4 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none ${formData.inventoryItemId ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
            >
              <option value="">None</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Store</label>
            <select
              name="subSourceStoreId"
              value={formData.subSourceStoreId}
              onChange={handleChange}
              disabled={!!formData.inventoryItemId}
              className={`w-full p-4 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none ${formData.inventoryItemId ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
            >
              <option value="">None</option>
              {subStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Sub-Store</label>
            <select
              name="subSubSourceStoreId"
              value={formData.subSubSourceStoreId}
              onChange={handleChange}
              disabled={!!formData.inventoryItemId}
              className={`w-full p-4 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none ${formData.inventoryItemId ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
            >
              <option value="">None</option>
              {subSubStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <input
            type="checkbox"
            id="isNotAvailable"
            name="isNotAvailable"
            checked={formData.isNotAvailable}
            onChange={handleChange}
            className="w-5 h-5 rounded-lg border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="isNotAvailable" className="text-sm font-bold text-[#0A192F]">
            Mark as Not Available
          </label>
        </div>

        {formData.isNotAvailable && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alternative Item</label>
            <select
              name="alternativeItemId"
              value={formData.alternativeItemId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
            </select>
          </div>
        )}
      </section>

      {/* VARIATION */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Variation
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
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
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variant</label>
            <input
              name="variant"
              value={formData.variant}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
        </div>
      </section>

      <Button type="submit" className="w-full py-6 rounded-2xl bg-[#0A192F] text-white hover:bg-[#1A293F]">
        {initialData?.id ? 'Update Item' : 'Add to List'}
      </Button>
    </form>
  );
};
