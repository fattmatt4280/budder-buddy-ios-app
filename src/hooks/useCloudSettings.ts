import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppSettings } from '@/types';
import { logger } from '@/lib/logger';

const LOCAL_STORAGE_KEY = 'budder_settings';

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

function getLocalSettings(): AppSettings {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function setLocalSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    logger.error('Failed to save settings to local storage:', error);
  }
}

export function useCloudSettings(userId: string | null) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Reset state when userId changes to prevent data leakage between accounts
  useEffect(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasSynced(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [userId]);

  // Fetch from cloud and merge/import local data
  useEffect(() => {
    if (!userId || hasSynced) return;

    const syncFromCloud = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          logger.error('Failed to fetch cloud settings:', error);
          setIsLoading(false);
          return;
        }

        const localSettings = getLocalSettings();

        if (!data) {
          // No cloud settings - import local settings to cloud
          logger.log('Importing local settings to cloud');
          
          // Use type assertion for the insert since types haven't regenerated yet
          const { error: insertError } = await (supabase
            .from('user_settings') as any)
            .insert({
              user_id: userId,
              settings: localSettings,
            });

          if (insertError) {
            logger.error('Failed to import settings to cloud:', insertError);
          } else {
            logger.log('Successfully imported settings to cloud');
          }
          setSettings(localSettings);
        } else {
          // Merge cloud settings with defaults (cloud takes precedence)
          const cloudSettings = data.settings as unknown as Partial<AppSettings>;
          const mergedSettings = { ...DEFAULT_SETTINGS, ...cloudSettings };
          setSettings(mergedSettings);
          setLocalSettings(mergedSettings);
        }

        setHasSynced(true);
      } catch (err) {
        logger.error('Error syncing settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    syncFromCloud();
  }, [userId, hasSynced]);

  // Persist to local storage whenever settings change
  useEffect(() => {
    if (hasSynced) {
      setLocalSettings(settings);
    }
  }, [settings, hasSynced]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (userId) {
      // Use type assertion since types haven't regenerated yet
      const { error } = await (supabase
        .from('user_settings') as any)
        .upsert({
          user_id: userId,
          settings: newSettings,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        logger.error('Failed to save settings to cloud:', error);
      }
    }
  }, [userId, settings]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);

    if (userId) {
      // Use type assertion since types haven't regenerated yet
      const { error } = await (supabase
        .from('user_settings') as any)
        .upsert({
          user_id: userId,
          settings: DEFAULT_SETTINGS,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        logger.error('Failed to reset settings in cloud:', error);
      }
    }
  }, [userId]);

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    hasSynced,
  };
}
