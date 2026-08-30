// Captures first-touch acquisition signals (UTM params, referrer, landing
// page) the moment the app loads — before auth exists to attach them to.
// Web only: a native app launch has no query string or document.referrer
// worth capturing, so this is a no-op there. Stashed in localStorage until
// an authenticated user_id exists to flush it onto (see useAttributionCapture).
import { Capacitor } from '@capacitor/core';

const KEY = 'bb_first_touch';

export function captureFirstTouch() {
  if (Capacitor.isNativePlatform()) return;
  try {
    if (localStorage.getItem(KEY)) return; // only ever record the first visit on this device
    const params = new URLSearchParams(window.location.search);
    const payload = {
      landing_page: window.location.pathname,
      referrer: document.referrer || null,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // localStorage unavailable (private mode, etc.) — acquisition just won't be captured
  }
}

export function readFirstTouch() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
