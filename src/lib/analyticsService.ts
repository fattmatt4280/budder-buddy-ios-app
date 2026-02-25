/**
 * Lightweight analytics service for launch funnel measurement.
 * Logs events to console in dev; ready to pipe to a real backend later.
 */
import { logger } from './logger';

export type AnalyticsEvent =
  | 'app_installed'
  | 'tattoo_added'
  | 'notifications_enabled'
  | 'first_checkin_completed'
  | 'day3_retained'
  | 'photo_uploaded'
  | 'upgrade_viewed'
  | 'upgrade_purchased';

interface EventPayload {
  [key: string]: string | number | boolean | null | undefined;
}

class AnalyticsService {
  private fired = new Set<string>();

  /** Track an event (fires once per session for unique events). */
  track(event: AnalyticsEvent, payload?: EventPayload, { once = false } = {}) {
    if (once && this.fired.has(event)) return;
    if (once) this.fired.add(event);

    const entry = {
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    // Dev logging — replace with real endpoint when ready
    logger.log('[Analytics]', JSON.stringify(entry));
  }

  /** Track only once per session (e.g. app_installed, first_checkin_completed). */
  trackOnce(event: AnalyticsEvent, payload?: EventPayload) {
    this.track(event, payload, { once: true });
  }
}

export const analytics = new AnalyticsService();
