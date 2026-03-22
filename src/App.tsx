import React from 'react';
import { useAppState } from './hooks/useAppState';
import MainLayout from './pages/MainLayout';
import Onboarding from './pages/Onboarding';

export default function App() {
  const { state } = useAppState();

  if (!state.household) {
    return <Onboarding />;
  }

  return <MainLayout />;
}
