import React, { createContext, useContext, ReactNode } from 'react';
import type { Tattoo, DailyCheckin, AppSettings } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCloudTattoos } from '@/hooks/useCloudTattoos';
import { useCloudSettings } from '@/hooks/useCloudSettings';
import { useCloudCheckins } from '@/hooks/useCloudCheckins';

interface AppDataContextType {
  // Tattoos
  tattoos: Tattoo[];
  addTattoo: (tattoo: Tattoo) => Promise<void> | void;
  updateTattoo: (id: string, updates: Partial<Tattoo>) => Promise<void> | void;
  deleteTattoo: (id: string) => Promise<void> | void;
  getTattoo: (id: string) => Tattoo | undefined;
  
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void> | void;
  resetSettings: () => Promise<void> | void;
  
  // Checkins
  checkins: DailyCheckin[];
  addCheckin: (checkin: DailyCheckin) => Promise<void> | void;
  updateCheckin: (id: string, updates: Partial<DailyCheckin>) => Promise<void> | void;
  getCheckinForDay: (tattooId: string, dayNumber: number) => DailyCheckin | undefined;
  getCheckinsForTattoo: (tattooId: string) => DailyCheckin[];
  
  // Auth state
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

interface AppDataProviderProps {
  children: ReactNode;
}

export function AppDataProvider({ children }: AppDataProviderProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  
  // Use cloud hooks - they handle auth state internally
  const {
    tattoos,
    addTattoo,
    updateTattoo,
    deleteTattoo,
    getTattoo,
    isLoading: tattoosLoading,
  } = useCloudTattoos(userId);
  
  const {
    settings,
    updateSettings,
    resetSettings,
    isLoading: settingsLoading,
  } = useCloudSettings(userId);
  
  const {
    checkins,
    addCheckin,
    updateCheckin,
    getCheckinForDay,
    getCheckinsForTattoo,
    isLoading: checkinsLoading,
  } = useCloudCheckins(userId);
  
  const isLoading = authLoading || tattoosLoading || settingsLoading || checkinsLoading;

  const value: AppDataContextType = {
    tattoos,
    addTattoo,
    updateTattoo,
    deleteTattoo,
    getTattoo,
    settings,
    updateSettings,
    resetSettings,
    checkins,
    addCheckin,
    updateCheckin,
    getCheckinForDay,
    getCheckinsForTattoo,
    userId,
    isAuthenticated,
    isLoading,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

// Convenience hooks that mimic the old API
export function useTattoosContext() {
  const { tattoos, addTattoo, updateTattoo, deleteTattoo, getTattoo } = useAppData();
  return { tattoos, addTattoo, updateTattoo, deleteTattoo, getTattoo };
}

export function useSettingsContext() {
  const { settings, updateSettings, resetSettings } = useAppData();
  return { settings, updateSettings, resetSettings };
}

export function useCheckinsContext() {
  const { checkins, addCheckin, updateCheckin, getCheckinForDay, getCheckinsForTattoo } = useAppData();
  return { checkins, addCheckin, updateCheckin, getCheckinForDay, getCheckinsForTattoo };
}
