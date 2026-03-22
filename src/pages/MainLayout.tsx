/**
 * Main Application Layout
 * 
 * Provides the consistent frame for all pages, including
 * the top header and bottom navigation bar.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';

// Page Components
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import GroceryList from './GroceryList';
import Tasks from './Tasks';
import Insights from './Insights';
import Settings from './Settings';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'inventory': return <Inventory />;
      case 'grocery': return <GroceryList />;
      case 'tasks': return <Tasks />;
      case 'insights': return <Insights />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
