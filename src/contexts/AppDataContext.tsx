import React, { createContext, useContext, ReactNode } from 'react';
import type { Tattoo, DailyCheckin, AppSettings } from '@/types';
import type { PlanType } from '@/lib/purchaseService';
import { useAuth } from '@/hooks/useAuth';
import { useCloudTattoos } from '@/hooks/useCloudTattoos';
import { useCloudSettings } from '@/hooks/useCloudSettings';
import { useCloudCheckins } from '@/hooks/useCloudCheckins';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

// Default settings for fallback
const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  notifSchedule: {
    morningTime: '09:00',
    eveningTime: '20:00',
    frequencyPreset: '2_per_day',
  },
  quietHoursEnabled: true,
  wakeTime: '09:00',
  bedTime: '23:00',
  reminderTypesEnabled: {
    wash: true,
    moisturize: true,
    checkin: true,
  },
  snoozeMinutes: '60',
  pausedUntil: null,
  cloudSyncEnabled: false,
  selectedTattooId: null,
  hasCompletedOnboarding: false,
  hasAcknowledgedDisclaimer: false,
  hasCompletedReminderSetup: false,
  remindersJustSaved: false,
  todayStartHereDismissed: false,
  notificationPermissionStatus: null,
  sunGuardEnabled: false,
  activityRemindersEnabled: true,
  longTermCareEnabled: false,
};

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
  
  // Premium
  isPro: boolean;
  premiumLoading: boolean;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
}

// Fallback context value for when provider isn't ready (hot-reload edge cases)
const fallbackContext: AppDataContextType = {
  tattoos: [],
  addTattoo: () => {},
  updateTattoo: () => {},
  deleteTattoo: () => {},
  getTattoo: () => undefined,
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
  checkins: [],
  addCheckin: () => {},
  updateCheckin: () => {},
  getCheckinForDay: () => undefined,
  getCheckinsForTattoo: () => [],
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  isPro: false,
  premiumLoading: true,
  purchase: async () => {},
  restore: async () => {},
};

const AppDataContext = createContext<AppDataContextType>(fallbackContext);

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

  const {
    isPro,
    isLoading: premiumLoading,
    purchase,
    restore,
  } = usePremiumStatus(userId);
  
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
    isPro,
    premiumLoading,
    purchase,
    restore,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
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
