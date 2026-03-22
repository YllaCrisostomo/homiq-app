/**
 * StockAlerts Component
 * 
 * Displays a list of inventory items that are low in stock or near expiry.
 */
import React from 'react';
import { InventoryItem } from '../../types';
import { Card } from '../UI';
import { AlertCircle, Package } from 'lucide-react';

interface StockAlertsProps {
  items: InventoryItem[];
  onSeeAll: () => void;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ items, onSeeAll }) => {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle size={18} />
          </div>
          <h3 className="font-bold text-lg text-[#0A192F]">Stock alerts</h3>
        </div>
        <button onClick={onSeeAll} className="text-xs font-bold text-[#00695C]">See all</button>
      </div>

      <div className="space-y-3">
        {items.map(item => {
          const isNoStock = item.actualAmount <= 0;
          const isNearExpiry = item.status === 'Near Expiry';
          
          let bgColor = 'bg-white';
          let textColor = 'text-gray-900';
          let badgeColor = 'bg-gray-100 text-gray-500';
          let iconColor = 'text-gray-400';

          if (isNoStock) {
            bgColor = 'bg-red-50';
            textColor = 'text-red-900';
            badgeColor = 'text-red-600';
            iconColor = 'text-red-400';
          } else if (isNearExpiry) {
            bgColor = 'bg-amber-50';
            textColor = 'text-amber-900';
            badgeColor = 'text-amber-600';
            iconColor = 'text-amber-400';
          }

          return (
            <Card key={item.id} className={`${bgColor} p-4 border-none shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${iconColor} shadow-sm`}>
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${textColor}`}>{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {item.brand} • {item.size}
                  </p>
                </div>
                <div className={`text-xs font-bold ${badgeColor}`}>
                  {isNearExpiry ? 'Near expiry' : `${item.actualAmount} ${item.actualAmountUOM}`}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
