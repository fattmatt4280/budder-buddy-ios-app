import { useEffect, useRef } from 'react';
import { notificationService } from '@/lib/notificationService';
import type { AppSettings } from '@/types';

/**
 * Boot-up hook that verifies notifications are properly scheduled.
 * If the app was killed or updated via TestFlight, pending notifications
 * may be lost. This hook detects that and reschedules them.
 *
 * Should be rendered once inside the authenticated app shell.
 */
export function useNotificationBootstrap(settings: AppSettings, isReady: boolean) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || !isReady) return;
    if (!settings.hasCompletedOnboarding) return;
    if (!settings.notificationsEnabled) return;

    hasRun.current = true;
    notificationService.verifyAndReschedule(settings);
  }, [settings, isReady]);
}
