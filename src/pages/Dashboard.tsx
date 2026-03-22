/**
 * Dashboard Page
 * 
 * Provides a high-level overview of the household's status,
 * including tasks, grocery list, and budget progress.
 */

import React from 'react';
import { CheckCircle2, ShoppingCart, PiggyBank, ArrowRight } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { getTimeLeftLabel, calculateNextDueDate } from '../utils/taskUtils';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { state } = useAppState();

  const overdueTasks = state.tasks.filter(t => t.status === 'Overdue').length;
  const pendingTasks = state.tasks.filter(t => t.status === 'Pending').length;
  const doneTasks = state.tasks.filter(t => t.status === 'Completed').length;

  const groceryCount = state.groceryList.length;
  const estTotal = state.groceryList.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

  // Budget calculations
  const rootCategories = state.masterData.filter(m => m.type === 'Category' && !m.parentId);
  const householdCurrency = state.household?.currencyCode || 'PHP';

  const getCategoryIds = (catId: string): string[] => {
    const ids = [catId];
    const children = state.masterData.filter(m => m.parentId === catId);
    children.forEach(child => {
      ids.push(...getCategoryIds(child.id));
    });
    return ids;
  };

  const calculateCategoryBudget = (cat: any): number => {
    const allCatIds = getCategoryIds(cat.id);
    return state.inventory
      .filter(item => (allCatIds.includes(item.categoryId) || allCatIds.includes(item.subCategoryId || '') || allCatIds.includes(item.subSubCategoryId || '')))
      .reduce((sum, item) => sum + (item.costPrice || 0), 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting */}
      <section>
        <h2 className="text-4xl font-black text-[#0A192F] tracking-tight">
          Hello, {state.user?.displayName || 'Alessandra'}!
        </h2>
        <p className="text-lg text-gray-400 font-medium mt-2">
          Your household is running smoothly today.
        </p>
      </section>

      {/* Tasks Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-black text-[#0A192F]">Today's tasks</h3>
          </div>
          <button 
            onClick={() => onNavigate('tasks')}
            className="text-sm font-black text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            See all
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <Badge variant="danger" size="sm" className="whitespace-nowrap">
            {overdueTasks} OVERDUE
          </Badge>
          <Badge variant="warning" size="sm" className="whitespace-nowrap">
            {pendingTasks} PENDING
          </Badge>
          <Badge variant="success" size="sm" className="whitespace-nowrap">
            {doneTasks} DONE
          </Badge>
        </div>

        {state.tasks
          .filter(t => t.status === 'Overdue' || t.status === 'Pending')
          .sort((a, b) => {
            if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
            if (a.status !== 'Overdue' && b.status === 'Overdue') return 1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          })
          .slice(0, 3)
          .map(task => (
            <Card key={task.id} padding="sm" className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${task.status === 'Overdue' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${task.status === 'Overdue' ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div>
                  <p className="font-bold text-[#0A192F]">{task.title}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {task.status} • {task.isRecurring ? `NEXT: ${calculateNextDueDate(task).toLocaleDateString()}` : new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant={task.status === 'Overdue' ? 'danger' : 'warning'}>{task.status}</Badge>
            </Card>
          ))}
      </section>

      {/* Grocery Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-black text-[#0A192F]">Grocery list</h3>
          </div>
          <button 
            onClick={() => onNavigate('grocery')}
            className="text-sm font-black text-teal-600 hover:text-teal-700"
          >
            Edit list
          </button>
        </div>
        
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {groceryCount} ITEMS • EST. {householdCurrency} {estTotal.toLocaleString()}
        </p>

        {state.groceryList.slice(0, 1).map(item => (
          <Card key={item.id} padding="sm" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-[#0A192F]">{item.name}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">• TODAY</p>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-500">{item.size || '1740 mL'}</p>
          </Card>
        ))}
      </section>

      {/* Budget Status */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <PiggyBank className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-black text-[#0A192F]">Budget status</h3>
          </div>
          <button 
            onClick={() => onNavigate('insights')}
            className="text-sm font-black text-teal-600 hover:text-teal-700"
          >
            Details
          </button>
        </div>
        
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          MARCH 2026 • BASE: {householdCurrency}
        </p>

        <Card className="space-y-6">
          {rootCategories.length > 0 ? rootCategories.map(cat => {
            const allCatIds = getCategoryIds(cat.id);
            const inCart = state.groceryList
              .filter(g => (allCatIds.includes(g.categoryId) || allCatIds.includes(g.subCategoryId || '') || allCatIds.includes(g.subSubCategoryId || '')) && g.isPurchased)
              .reduce((sum, g) => sum + (g.actualPrice || 0), 0);
            const history = (state.purchaseHistory || [])
              .filter(g => (allCatIds.includes(g.categoryId) || allCatIds.includes(g.subCategoryId || '') || allCatIds.includes(g.subSubCategoryId || '')))
              .reduce((sum, g) => sum + (g.actualPrice || 0), 0);
            
            const spent = inCart + history;
            const budget = calculateCategoryBudget(cat);
            
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="font-bold text-[#0A192F]">{cat.name}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {householdCurrency} {spent.toLocaleString()} / {budget.toLocaleString()}
                  </p>
                </div>
                <ProgressBar value={spent} max={budget} variant={spent > budget ? 'danger' : 'success'} />
              </div>
            );
          }) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="font-bold text-[#0A192F]">Kitchen</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PHP 0 / 5,000</p>
                </div>
                <ProgressBar value={0} max={5000} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="font-bold text-[#0A192F]">Kitchen &gt; Dry</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PHP 0 / 5,000</p>
                </div>
                <ProgressBar value={0} max={5000} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="font-bold text-[#0A192F]">Bathroom</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PHP 0 / 5,000</p>
                </div>
                <ProgressBar value={0} max={5000} />
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
