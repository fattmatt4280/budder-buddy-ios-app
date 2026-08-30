import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { readFirstTouch } from '@/lib/firstTouch';
import { logger } from '@/lib/logger';

const FLUSHED_KEY = 'bb_attribution_flushed';

// One-time, best-effort: once a user_id exists, attach whatever first-touch
// data captureFirstTouch() stashed pre-auth. Safe to call every render — it
// no-ops after the first successful flush for this user (or if there was
// never anything to flush, e.g. a native-app signup).
export function useAttributionCapture(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    if (localStorage.getItem(FLUSHED_KEY) === userId) return;

    const firstTouch = readFirstTouch();
    if (!firstTouch) {
      localStorage.setItem(FLUSHED_KEY, userId);
      return;
    }

    // Table not in the generated Database type yet — same `as any` pattern
    // used in useCloudSettings.ts for user_settings before its types synced.
    (supabase.from('user_attribution' as any) as any)
      .insert({ user_id: userId, ...firstTouch })
      .then(({ error }: { error: { code?: string } | null }) => {
        // 23505 = unique violation (already captured for this user) — expected, not an error.
        if (error && error.code !== '23505') {
          logger.error('[Attribution] Failed to record first touch:', error);
        }
        localStorage.setItem(FLUSHED_KEY, userId);
      });
  }, [userId]);
}
