// @refresh reset
import { useState, useEffect, useCallback, useRef } from 'react';
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
  hasSeenWalkthrough: false,
  lastBetaFeedbackPromptDate: null,
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
  // Initialize from local storage so persisted flags (like hasSeenWalkthrough)
  // are immediately available, preventing stale-default flashes.
  const [settings, setSettings] = useState<AppSettings>(getLocalSettings);
  // Start true — walkthrough/UI gates on isLoading until cloud sync finishes
  const [isLoading, setIsLoading] = useState(true);
  const [hasSynced, setHasSynced] = useState(false);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // Reset state when userId actually changes (not on HMR remount)
  useEffect(() => {
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = userId;
      return;
    }
    if (prevUserIdRef.current === userId) return;
    // A guest (userId null, e.g. an anonymous session or pre-auth local state)
    // claiming a real account is NOT an account switch — it's the same person's
    // data gaining a user id. Wiping localStorage here would delete it out from
    // under the "import local settings to cloud" step below, right before it
    // reads getLocalSettings() — that's the bug that sent onboarding progress
    // back to square one right after sign-up. Only wipe on an actual switch
    // between two different real accounts (or sign-out).
    const wasGuestClaimingAccount = prevUserIdRef.current === null && userId !== null;
    prevUserIdRef.current = userId;
    setSettings(DEFAULT_SETTINGS);
    setHasSynced(false);
    setIsLoading(true); // Block UI until new user's cloud settings load
    if (!wasGuestClaimingAccount) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [userId]);

  // Fetch from cloud and merge/import local data
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    if (hasSynced) return;

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

  // Persist to local storage whenever settings change. Gated on hasSynced
  // when there's a real account to avoid a pre-sync write of stale/default
  // settings clobbering the real cloud data still loading in — but for a true
  // guest (no userId at all, e.g. anonymous auth unavailable) there is no
  // cloud sync coming, so hasSynced would never flip and nothing would ever
  // get saved; persist immediately in that case instead.
  useEffect(() => {
    if (hasSynced || !userId) {
      setLocalSettings(settings);
    }
  }, [settings, hasSynced, userId]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Get current session directly to avoid stale userId closure
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (currentUserId) {
      // Use type assertion since types haven't regenerated yet
      const { error } = await (supabase
        .from('user_settings') as any)
        .upsert({
          user_id: currentUserId,
          settings: newSettings,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        logger.error('Failed to save settings to cloud:', error);
      }
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);

    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (currentUserId) {
      // Use type assertion since types haven't regenerated yet
      const { error } = await (supabase
        .from('user_settings') as any)
        .upsert({
          user_id: currentUserId,
          settings: DEFAULT_SETTINGS,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        logger.error('Failed to reset settings in cloud:', error);
      }
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    hasSynced,
  };
}
