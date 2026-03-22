import { AppState, InventoryItem, Task, GroceryItem } from '../types';

export const calculateInventoryStats = (state: AppState) => {
  const inventory = state.inventory || [];
  return {
    noStock: inventory.filter(i => i.status === 'No Stock'),
    lowStock: inventory.filter(i => i.status === 'Low Stock'),
    expired: inventory.filter(i => i.status === 'Expired'),
    nearExpiry: inventory.filter(i => i.status === 'Near Expiry'),
    avgConsumptionRate: 2.5, // Mocked for now
    avgDaysUntilDepletion: 12, // Mocked for now
    wastedCost: inventory.filter(i => i.status === 'Expired').reduce((acc, i) => acc + (i.costPrice * i.actualAmount), 0),
    stockHealth: 85, // Mocked
    topConsumed: inventory.slice(0, 3)
  };
};

export const calculateTaskStats = (state: AppState) => {
  const tasks = state.tasks || [];
  const done = tasks.filter(t => t.status === 'Completed');
  const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed');
  
  return {
    overdueCount: overdue.length,
    pendingCount: tasks.filter(t => t.status !== 'Completed').length,
    doneCount: done.length,
    onTimeRate: 92,
    completionRate: tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0,
    maxStreak: 5,
    workload: state.masterData
      .filter(m => m.type === 'HouseholdMember')
      .map(m => ({
        name: m.name,
        count: tasks.filter(t => t.assigneeId === m.id).length,
        completed: tasks.filter(t => t.assigneeId === m.id && t.status === 'Completed').length
      })),
    categoryStats: [],
    totalInventoryDeductions: 0
  };
};

export const calculateGrocerySummary = (state: AppState) => {
  const list = state.groceryList || [];
  return {
    items: list.slice(0, 5),
    count: list.length,
    estimatedTotal: list.reduce((acc, i) => acc + (i.estimatedPrice * i.quantity), 0)
  };
};

export const calculateGroceryBudgetStats = (state: AppState) => {
  const categories = state.masterData.filter(m => m.type === 'Category');
  const groceryList = state.groceryList || [];

  const catStats = categories.map(cat => {
    const budget = cat.budget || 1000;
    const actual = groceryList
      .filter(i => i.categoryId === cat.id && i.isPurchased)
      .reduce((acc, i) => acc + (i.actualPrice || i.estimatedPrice * i.quantity), 0);
    
    return {
      name: cat.name,
      budget,
      actual,
      percent: budget > 0 ? Math.round((actual / budget) * 100) : 0
    };
  });

  const totalBudget = catStats.reduce((acc, c) => acc + c.budget, 0);
  const totalActual = catStats.reduce((acc, c) => acc + c.actual, 0);

  return {
    categories: catStats,
    totalBudget,
    totalActual,
    totalVariance: totalBudget - totalActual,
    overspentCount: catStats.filter(c => c.actual > c.budget).length
  };
};

export const calculateSpendByLocation = (state: AppState) => {
  const stores = state.masterData.filter(m => m.type === 'SourceStore');
  const groceryList = state.groceryList || [];

  return stores.map(store => ({
    name: store.name,
    value: groceryList
      .filter(i => i.sourceStoreId === store.id && i.isPurchased)
      .reduce((acc, i) => acc + (i.actualPrice || i.estimatedPrice * i.quantity), 0)
  })).filter(s => s.value > 0);
};
