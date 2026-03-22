/**
 * GrocerySummary Component
 * 
 * Displays a summary of the grocery list with estimated costs and a brief item list.
 */
import React from 'react';
import { GroceryItem } from '../../types';
import { Card } from '../UI';
import { ShoppingCart, Package } from 'lucide-react';

interface GrocerySummaryProps {
  items: GroceryItem[];
  count: number;
  estimatedTotal: number;
  currency: string;
  onEdit: () => void;
}

export const GrocerySummary: React.FC<GrocerySummaryProps> = ({ items, count, estimatedTotal, currency, onEdit }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <ShoppingCart size={18} />
          </div>
          <h3 className="font-bold text-lg text-[#0A192F]">Grocery list</h3>
        </div>
        <button onClick={onEdit} className="text-xs font-bold text-[#00695C]">Edit list</button>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <span>{count} items</span>
        <span>•</span>
        <span>Est. {currency} {estimatedTotal.toLocaleString()}</span>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="p-4 border-none shadow-sm bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                <Package size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-[#0A192F]">{item.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {item.sourceStoreId} • Today
                </p>
              </div>
              <div className="text-xs font-bold text-gray-500">
                {item.quantity} {item.size || 'L'}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
