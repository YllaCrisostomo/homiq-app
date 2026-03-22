/**
 * Settings Home Page
 * 
 * Main navigation for household configuration,
 * including categories, members, and stores.
 */

import React, { useState } from 'react';
import { ChevronRight, LayoutGrid, CheckSquare, ShoppingBag, Users, Bell, Globe, DollarSign } from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Sub-pages
import Categories from './Categories';
import TaskCategories from './TaskCategories';
import Stores from './Stores';
import Members from './Members';

export default function SettingsHome() {
  const { state } = useAppState();
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);

  const settingsItems = [
    { id: 'categories', label: 'Categories', icon: LayoutGrid, description: 'Manage your category data' },
    { id: 'task-categories', label: 'Task Categories', icon: CheckSquare, description: 'Manage your taskcategory data' },
    { id: 'stores', label: 'Source Stores', icon: ShoppingBag, description: 'Manage your sourcestore data' },
    { id: 'members', label: 'Household Members', icon: Users, description: 'Manage your householdmember data' },
  ];

  if (activeSubPage === 'categories') return <Categories onBack={() => setActiveSubPage(null)} />;
  if (activeSubPage === 'task-categories') return <TaskCategories onBack={() => setActiveSubPage(null)} />;
  if (activeSubPage === 'stores') return <Stores onBack={() => setActiveSubPage(null)} />;
  if (activeSubPage === 'members') return <Members onBack={() => setActiveSubPage(null)} />;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-[#0A192F] tracking-tight">Settings</h2>
        <p className="text-gray-400 font-medium tracking-tight">Configure your Homiq experience</p>
      </div>

      {/* Main Settings */}
      <section className="space-y-4">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.id} 
              padding="sm" 
              hoverable 
              onClick={() => setActiveSubPage(item.id)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-teal-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0A192F] tracking-tight">{item.label}</h3>
                  <p className="text-xs text-gray-400 font-medium">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-teal-500 transition-all group-hover:translate-x-1" />
            </Card>
          );
        })}
      </section>

      {/* App Preferences */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gray-200 rounded-full" />
          <h3 className="text-lg font-black text-[#0A192F] uppercase tracking-widest">App Preferences</h3>
        </div>

        <div className="space-y-4">
          <Card padding="sm" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0A192F] tracking-tight">Notifications</h3>
                <p className="text-xs text-gray-400 font-medium">Manage app alerts</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-gray-100 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </Card>

          <Card padding="sm" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0A192F] tracking-tight">Language</h3>
                <p className="text-xs text-gray-400 font-medium">English (US)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200" />
          </Card>

          <Card padding="sm" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0A192F] tracking-tight">Currency</h3>
                <p className="text-xs text-gray-400 font-medium">PHP (₱)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200" />
          </Card>
        </div>
      </section>
    </div>
  );
}
