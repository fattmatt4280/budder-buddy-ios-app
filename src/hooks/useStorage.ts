import { useState, useEffect, useCallback } from 'react';
import type { Tattoo, DailyCheckin, PhotoEntry, AppSettings } from '@/types';
import { logger } from '@/lib/logger';

const STORAGE_KEYS = {
  TATTOOS: 'budder_tattoos',
  CHECKINS: 'budder_checkins',
  PHOTOS: 'budder_photos',
  SETTINGS: 'budder_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  notifSchedule: {
    morningTime: '09:00',
    eveningTime: '20:00',
    frequencyPreset: '2_per_day',
  },
  // Smart Reminders defaults
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
  // Existing settings
  cloudSyncEnabled: false,
  selectedTattooId: null,
  hasCompletedOnboarding: false,
  hasAcknowledgedDisclaimer: false,
  hasCompletedReminderSetup: false,
  // Post-reminder UX flags
  remindersJustSaved: false,
  todayStartHereDismissed: false,
  notificationPermissionStatus: null,
  // Environment notifications
  sunGuardEnabled: false,
  activityRemindersEnabled: true,
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    // Keep multiple hook instances in sync within the same tab
    window.dispatchEvent(
      new CustomEvent('budder-storage', {
        detail: { key },
      })
    );
  } catch (error) {
    logger.error('Failed to save to storage:', error);
  }
}

// Tattoos Hook
export function useTattoos() {
  const [tattoos, setTattoos] = useState<Tattoo[]>(() =>
    getFromStorage(STORAGE_KEYS.TATTOOS, [])
  );

  useEffect(() => {
    setToStorage(STORAGE_KEYS.TATTOOS, tattoos);
  }, [tattoos]);

  const addTattoo = useCallback((tattoo: Tattoo) => {
    setTattoos((prev) => [...prev, tattoo]);
  }, []);

  const updateTattoo = useCallback((id: string, updates: Partial<Tattoo>) => {
    setTattoos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTattoo = useCallback((id: string) => {
    setTattoos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTattoo = useCallback(
    (id: string) => tattoos.find((t) => t.id === id),
    [tattoos]
  );

  return { tattoos, addTattoo, updateTattoo, deleteTattoo, getTattoo };
}

// Check-ins Hook
export function useCheckins() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() =>
    getFromStorage(STORAGE_KEYS.CHECKINS, [])
  );

  useEffect(() => {
    setToStorage(STORAGE_KEYS.CHECKINS, checkins);
  }, [checkins]);

  const addCheckin = useCallback((checkin: DailyCheckin) => {
    setCheckins((prev) => [...prev, checkin]);
  }, []);

  const updateCheckin = useCallback(
    (id: string, updates: Partial<DailyCheckin>) => {
      setCheckins((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const getCheckinForDay = useCallback(
    (tattooId: string, dayNumber: number) =>
      checkins.find((c) => c.tattooId === tattooId && c.dayNumber === dayNumber),
    [checkins]
  );

  const getCheckinsForTattoo = useCallback(
    (tattooId: string) => checkins.filter((c) => c.tattooId === tattooId),
    [checkins]
  );

  return { checkins, addCheckin, updateCheckin, getCheckinForDay, getCheckinsForTattoo };
}

// Photos Hook
export function usePhotos() {
  const [photos, setPhotos] = useState<PhotoEntry[]>(() =>
    getFromStorage(STORAGE_KEYS.PHOTOS, [])
  );

  useEffect(() => {
    setToStorage(STORAGE_KEYS.PHOTOS, photos);
  }, [photos]);

  const addPhoto = useCallback((photo: PhotoEntry) => {
    setPhotos((prev) => [...prev, photo]);
  }, []);

  const updatePhoto = useCallback((id: string, updates: Partial<PhotoEntry>) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPhotosForTattoo = useCallback(
    (tattooId: string) =>
      photos
        .filter((p) => p.tattooId === tattooId)
        .sort((a, b) => b.dayNumber - a.dayNumber),
    [photos]
  );

  const getPhotosForDay = useCallback(
    (tattooId: string, dayNumber: number) =>
      photos.filter((p) => p.tattooId === tattooId && p.dayNumber === dayNumber),
    [photos]
  );

  return { photos, addPhoto, updatePhoto, deletePhoto, getPhotosForTattoo, getPhotosForDay };
}

// Settings Hook
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  // Persist local changes
  useEffect(() => {
    setToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Sync across multiple hook instances (same tab) + other tabs
  useEffect(() => {
    const syncFromStorage = () => {
      setSettings(getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SETTINGS) syncFromStorage();
    };

    const onBudderStorage = (e: Event) => {
      const ce = e as CustomEvent<{ key: string }>;
      if (ce.detail?.key === STORAGE_KEYS.SETTINGS) syncFromStorage();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('budder-storage', onBudderStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('budder-storage', onBudderStorage);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
