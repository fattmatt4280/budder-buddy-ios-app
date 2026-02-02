import { useState, useEffect, useCallback } from 'react';
import type { Tattoo, DailyCheckin, PhotoEntry, AppSettings } from '@/types';
import { logger } from '@/lib/logger';

// Re-export context hooks for use in components
export { 
  useAppData,
  useTattoosContext as useTattoos,
  useSettingsContext as useSettings,
  useCheckinsContext as useCheckins,
} from '@/contexts/AppDataContext';

// Re-export cloud hooks for direct usage
export { useCloudTattoos } from './useCloudTattoos';
export { useCloudSettings } from './useCloudSettings';
export { useCloudCheckins } from './useCloudCheckins';

const STORAGE_KEYS = {
  PHOTOS: 'budder_photos',
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
  } catch (error) {
    logger.error('Failed to save to storage:', error);
  }
}

// Photos Hook (local only, cloud photos use useCloudPhotos)
export function usePhotos() {
  const [photos, setPhotos] = useState<PhotoEntry[]>(() =>
    getFromStorage(STORAGE_KEYS.PHOTOS, [])
  );

  useEffect(() => {
    setToStorage(STORAGE_KEYS.PHOTOS, photos);
  }, [photos]);

  // Sync from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PHOTOS && e.newValue) {
        try {
          setPhotos(JSON.parse(e.newValue));
        } catch {
          // ignore parse errors
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
