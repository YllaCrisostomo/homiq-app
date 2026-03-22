/**
 * BudgetSummary Component
 * 
 * Displays budget progress bars for different categories.
 */
import React from 'react';
import { Card, ProgressBar } from '../UI';
import { PiggyBank } from 'lucide-react';

interface BudgetSummaryProps {
  categories: {
    name: string;
    budget: number;
    actual: number;
    percent: number;
  }[];
  currency: string;
  onDetails: () => void;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ categories, currency, onDetails }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <PiggyBank size={18} />
          </div>
          <h3 className="font-bold text-lg text-[#0A192F]">Budget status</h3>
        </div>
        <button onClick={onDetails} className="text-xs font-bold text-[#00695C]">Details</button>
      </div>

      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        March 2026 • Base: {currency}
      </div>

      <Card className="p-6 border-none shadow-sm space-y-6">
        {categories.map(cat => {
          const isOver = cat.actual > cat.budget;
          const isNear = cat.percent > 80 && !isOver;
          
          let barColor = 'bg-emerald-500';
          if (isOver) barColor = 'bg-rose-500';
          else if (isNear) barColor = 'bg-amber-500';

          return (
            <div key={cat.name} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-[#0A192F]">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">
                    {currency} {cat.actual.toLocaleString()} / {cat.budget.toLocaleString()}
                  </span>
                </div>
              </div>
              <ProgressBar 
                value={cat.actual} 
                max={cat.budget} 
                color={barColor} 
              />
            </div>
          );
        })}
      </Card>
    </section>
  );
};
