import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  Package, ShoppingCart, CheckCircle2, Users, 
  TrendingUp, AlertTriangle, DollarSign, ArrowUpRight,
  Calendar, Layers, Store, PiggyBank
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MasterDataItem } from '../types';

const COLORS = ['#0D9488', '#0F172A', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Insights() {
  const { state } = useAppState();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // --- STOCK INSIGHTS ---
  const stockStats = useMemo(() => {
    const total = state.inventory.length;
    const available = state.inventory.filter(i => i.status === 'Available').length;
    const nearExpiry = state.inventory.filter(i => i.status === 'Near Expiry').length;
    const expired = state.inventory.filter(i => i.status === 'Expired').length;
    const lowStock = state.inventory.filter(i => i.status === 'Low Stock').length;
    const noStock = state.inventory.filter(i => i.status === 'No Stock').length;
    const inactive = state.inventory.filter(i => i.status === 'Inactive').length;

    return [
      { name: 'Available', value: available, color: '#10B981' },
      { name: 'Inactive', value: inactive, color: '#475569' },
      { name: 'Near Expiry', value: nearExpiry, color: '#F59E0B' },
      { name: 'Expired', value: expired, color: '#EF4444' },
      { name: 'Low Stock', value: lowStock, color: '#F97316' },
      { name: 'No Stock', value: noStock, color: '#94A3B8' },
    ];
  }, [state.inventory]);

  // --- SHOP INSIGHTS ---
  const calculateCategoryBudget = (cat: MasterDataItem): number => {
    const allCatIds = getCategoryIds(cat.id);
    return state.inventory
      .filter(item => (allCatIds.includes(item.categoryId) || allCatIds.includes(item.subCategoryId || '') || allCatIds.includes(item.subSubCategoryId || '')))
      .reduce((sum, item) => sum + (item.costPrice || 0), 0);
  };

  const getCategoryIds = (catId: string): string[] => {
    const ids = [catId];
    const children = state.masterData.filter(m => m.parentId === catId);
    children.forEach(child => {
      ids.push(...getCategoryIds(child.id));
    });
    return ids;
  };

  const shopInsights = useMemo(() => {
    const categories = state.masterData.filter(m => m.type === 'Category');
    
    return categories.map(cat => {
      const allCatIds = getCategoryIds(cat.id);
      const budget = calculateCategoryBudget(cat);
      const actual = (state.purchaseHistory || [])
        .filter(g => {
          if (!g.purchaseDate) return false;
          const date = new Date(g.purchaseDate);
          return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        })
        .filter(g => (allCatIds.includes(g.categoryId) || allCatIds.includes(g.subCategoryId || '') || allCatIds.includes(g.subSubCategoryId || '')))
        .reduce((sum, g) => sum + (g.actualPrice || 0) * g.quantity, 0);
      
      return {
        name: cat.name,
        budget,
        actual,
        excess: budget - actual,
        isRoot: !cat.parentId
      };
    });
  }, [state.purchaseHistory, state.masterData, selectedMonth, selectedYear]);

  const shopByStore = useMemo(() => {
    const spending: { [key: string]: number } = {};
    (state.purchaseHistory || [])
      .filter(g => {
        if (!g.purchaseDate) return false;
        const date = new Date(g.purchaseDate);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      })
      .forEach(item => {
        const store = state.masterData.find(m => m.id === item.sourceStoreId)?.name;
        if (store && store !== 'Any Store') {
          const cost = (item.actualPrice || 0) * item.quantity;
          spending[store] = (spending[store] || 0) + cost;
        }
      });
    return Object.entries(spending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [state.purchaseHistory, state.masterData, selectedMonth, selectedYear]);

  // --- TASK INSIGHTS ---
  const taskInsights = useMemo(() => {
    const completed = state.tasks.filter(t => {
      if (t.status !== 'Completed' && !t.lastCompleted) return false;
      const date = new Date(t.completedAt || t.lastCompleted || '');
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
    const onSchedule = completed.filter(t => {
      if (!t.completedAt) return false;
      if (!t.isRecurring) {
        return new Date(t.completedAt) <= new Date(t.dueDate);
      }
      return true;
    }).length;

    const statsByMember = {};
    state.tasks.forEach(task => {
      const member = state.masterData.find(m => m.id === task.assigneeId)?.name || 'Unassigned';
      if (!statsByMember[member]) statsByMember[member] = { completed: 0, total: 0 };
      
      // Only count completed if in selected month
      let isCompletedInPeriod = false;
      if (task.status === 'Completed' || task.lastCompleted) {
        const date = new Date(task.completedAt || task.lastCompleted || '');
        if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
          isCompletedInPeriod = true;
        }
      }

      // For total, we count tasks that were active or due in this period
      const dueDate = new Date(task.dueDate);
      const isActiveInPeriod = dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;

      if (isActiveInPeriod || isCompletedInPeriod) {
        statsByMember[member].total++;
        if (isCompletedInPeriod) statsByMember[member].completed++;
      }
    });

    const memberWorkload = Object.entries(statsByMember).map(([name, s]: [string, any]) => ({
      name,
      completed: s.completed,
      pending: s.total - s.completed,
      total: s.total
    }));

    const statsByCategory = {};
    state.tasks.forEach(task => {
      const cat = state.masterData.find(m => m.id === task.categoryId)?.name || 'General';
      if (!statsByCategory[cat]) statsByCategory[cat] = { completed: 0, total: 0 };

      let isCompletedInPeriod = false;
      if (task.status === 'Completed' || task.lastCompleted) {
        const date = new Date(task.completedAt || task.lastCompleted || '');
        if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
          isCompletedInPeriod = true;
        }
      }

      const dueDate = new Date(task.dueDate);
      const isActiveInPeriod = dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;

      if (isActiveInPeriod || isCompletedInPeriod) {
        statsByCategory[cat].total++;
        if (isCompletedInPeriod) statsByCategory[cat].completed++;
      }
    });

    const categoryCompletion = Object.entries(statsByCategory).map(([name, s]: [string, any]) => ({
      name,
      rate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
    }));

    // Group tasks by month for completion trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const trendData = months.map((month, index) => {
      const monthTasks = state.tasks.filter(t => {
        const date = new Date(t.dueDate);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });
      const completed = monthTasks.filter(t => t.status === 'Completed').length;
      return {
        name: month,
        total: monthTasks.length,
        completed
      };
    });

    return {
      onSchedule,
      totalCompleted: completed.length,
      memberWorkload,
      categoryCompletion,
      trendData
    };
  }, [state.tasks, state.masterData, selectedMonth, selectedYear]);

  const householdCurrency = state.household?.currencyCode || 'PHP';

  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-[#0A192F] tracking-tight italic">Insights</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Household Analytics & Performance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-white shadow-sm border-none py-2 px-4 rounded-full text-xs font-black text-[#0A192F] uppercase tracking-widest focus:ring-0 cursor-pointer"
          >
            {months.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white shadow-sm border-none py-2 px-4 rounded-full text-xs font-black text-[#0A192F] uppercase tracking-widest focus:ring-0 cursor-pointer"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      {/* --- STOCK SECTION --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
            <Package size={20} />
          </div>
          <h3 className="text-xl font-black text-[#0A192F] uppercase tracking-tight">Stock Inventory</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Card className="p-4 text-center space-y-1 bg-white border-none shadow-sm rounded-3xl col-span-2">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-black text-[#0A192F]">{state.inventory.length}</p>
          </Card>
          {stockStats.map(stat => (
            <Card key={stat.name} className="p-4 text-center space-y-1 bg-white border-none shadow-sm rounded-3xl">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{stat.name}</p>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-white border-none shadow-sm rounded-[40px]">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {stockStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* --- SHOP SECTION --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <ShoppingCart size={20} />
          </div>
          <h3 className="text-xl font-black text-[#0A192F] uppercase tracking-tight">Shopping & Budget</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 bg-white border-none shadow-sm rounded-[40px] space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest">Budget vs Actual (Root Categories)</h4>
              <PiggyBank size={18} className="text-gray-200" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shopInsights.filter(i => i.isRoot)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                  <Bar dataKey="budget" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="Budgeted" />
                  <Bar dataKey="actual" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Actual Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 bg-white border-none shadow-sm rounded-[40px] space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest">Spending by Source Store</h4>
              <Store size={18} className="text-gray-200" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shopByStore}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                  >
                    {shopByStore.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${householdCurrency} ${value.toLocaleString()}`, 'Spent']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 bg-white border-none shadow-sm rounded-[40px] space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest">Budget Excess/Deficit per Category</h4>
              <TrendingUp size={18} className="text-gray-200" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shopInsights}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="excess" radius={[6, 6, 6, 6]}>
                    {shopInsights.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.excess >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      {/* --- TASK SECTION --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <CheckCircle2 size={20} />
          </div>
          <h3 className="text-xl font-black text-[#0A192F] uppercase tracking-tight">Task Performance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-white border-none shadow-sm rounded-[32px] flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Done on Schedule</p>
              <h4 className="text-2xl font-black text-[#0A192F]">{taskInsights.onSchedule}</h4>
            </div>
          </Card>
          <Card className="p-6 bg-white border-none shadow-sm rounded-[32px] flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Completed</p>
              <h4 className="text-2xl font-black text-[#0A192F]">{taskInsights.totalCompleted}</h4>
            </div>
          </Card>
          <Card className="p-6 bg-white border-none shadow-sm rounded-[32px] flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Overall Rate</p>
              <h4 className="text-2xl font-black text-[#0A192F]">
                {state.tasks.length > 0 ? Math.round((taskInsights.totalCompleted / state.tasks.length) * 100) : 0}%
              </h4>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 bg-white border-none shadow-sm rounded-[40px] space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest">Completion Rate by Category</h4>
              <Layers size={18} className="text-gray-200" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskInsights.categoryCompletion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="rate" fill="#0D9488" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 bg-white border-none shadow-sm rounded-[40px] space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest">Member Workload</h4>
              <Users size={18} className="text-gray-200" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskInsights.memberWorkload}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                  <Bar dataKey="completed" stackId="a" fill="#0D9488" name="Completed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#F1F5F9" name="Pending" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 bg-white border-none shadow-sm rounded-[40px] space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest">Task Completion Trend (Monthly)</h4>
              <TrendingUp size={18} className="text-gray-200" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskInsights.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="total" stroke="#94A3B8" strokeWidth={3} dot={{ r: 4, fill: '#94A3B8' }} name="Total Tasks" />
                  <Line type="monotone" dataKey="completed" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, fill: '#0D9488' }} name="Completed Tasks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
