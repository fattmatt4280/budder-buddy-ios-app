import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { logger } from './logger';
import type { AppSettings } from '@/types';

export interface UVData {
  uvIndex: number;
  uvLevel: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
  message: string;
  lastChecked: string;
}

export interface SubmergeCountdown {
  daysRemaining: number;
  safeDate: string;
  isSafe: boolean;
  message: string;
}

const UV_NOTIFICATION_ID = 9000;
const CELEBRATION_NOTIFICATION_ID = 9001;
const SAFE_DAYS = 14;

/**
 * Get UV level category based on UV index
 */
function getUVLevel(uvIndex: number): UVData['uvLevel'] {
  if (uvIndex <= 2) return 'low';
  if (uvIndex <= 5) return 'moderate';
  if (uvIndex <= 7) return 'high';
  if (uvIndex <= 10) return 'very_high';
  return 'extreme';
}

/**
 * Get friendly message based on UV level
 */
function getUVMessage(uvIndex: number): string {
  const level = getUVLevel(uvIndex);
  switch (level) {
    case 'low':
      return 'UV is low today. Your tattoo should be fine, but shade is always better!';
    case 'moderate':
      return 'Moderate UV today. Consider covering your tattoo if outside for extended periods.';
    case 'high':
      return '⚠️ High UV today! Keep that new ink covered or stay in the shade.';
    case 'very_high':
      return '🔥 Very high UV! Definitely keep your healing tattoo covered and avoid prolonged sun exposure.';
    case 'extreme':
      return '☀️ Extreme UV! Stay indoors or fully cover your tattoo. This level can damage healing skin.';
  }
}

/**
 * Calculate safe to submerge countdown
 */
export function calculateSubmergeCountdown(tattooDate: string): SubmergeCountdown {
  const tattoo = new Date(tattooDate);
  const today = new Date();
  tattoo.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - tattoo.getTime();
  const daysSinceTattoo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, SAFE_DAYS - daysSinceTattoo);

  const safeDate = new Date(tattoo);
  safeDate.setDate(safeDate.getDate() + SAFE_DAYS);

  const isSafe = daysRemaining === 0;
  const message = isSafe
    ? "🎉 You're clear! Your tattoo is healed enough for swimming and gym activities."
    : `🏊 ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} until it's safe to swim or hit the gym.`;

  return {
    daysRemaining,
    safeDate: safeDate.toISOString().split('T')[0],
    isSafe,
    message,
  };
}

class EnvironmentService {
  private isNative: boolean;
  private lastUVCheck: UVData | null = null;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Get current position using Capacitor Geolocation
   */
  async getCurrentPosition(): Promise<{ lat: number; lon: number } | null> {
    try {
      // Request permission first
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          logger.log('[EnvironmentService] Location permission denied');
          return null;
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000,
      });

      return {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
    } catch (error) {
      logger.error('[EnvironmentService] Failed to get position:', error);
      
      // Fallback: try browser geolocation on web
      if (!this.isNative && 'geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 10000 }
          );
        });
      }
      
      return null;
    }
  }

  /**
   * Fetch UV index from Open-Meteo API (free, no API key needed)
   */
  async fetchUVIndex(lat: number, lon: number): Promise<UVData | null> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto&forecast_days=1`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status}`);
      }

      const data = await response.json();
      const uvIndex = Math.round(data.daily?.uv_index_max?.[0] ?? 0);

      const uvData: UVData = {
        uvIndex,
        uvLevel: getUVLevel(uvIndex),
        message: getUVMessage(uvIndex),
        lastChecked: new Date().toISOString(),
      };

      this.lastUVCheck = uvData;
      logger.log('[EnvironmentService] UV data:', uvData);
      
      return uvData;
    } catch (error) {
      logger.error('[EnvironmentService] Failed to fetch UV:', error);
      return null;
    }
  }

  /**
   * Check UV and optionally send notification if high
   */
  async checkUVAndNotify(settings: AppSettings): Promise<UVData | null> {
    if (!settings.sunGuardEnabled) {
      return null;
    }

    const position = await this.getCurrentPosition();
    if (!position) {
      logger.log('[EnvironmentService] Could not get position for UV check');
      return null;
    }

    const uvData = await this.fetchUVIndex(position.lat, position.lon);
    if (!uvData) {
      return null;
    }

    // Send notification if UV is high or above
    if (uvData.uvLevel === 'high' || uvData.uvLevel === 'very_high' || uvData.uvLevel === 'extreme') {
      await this.sendUVNotification(uvData);
    }

    return uvData;
  }

  /**
   * Send UV warning notification
   */
  private async sendUVNotification(uvData: UVData): Promise<void> {
    if (!this.isNative) return;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: UV_NOTIFICATION_ID,
          title: '☀️ Sun Guard Alert',
          body: `UV Index: ${uvData.uvIndex} - ${uvData.message}`,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          extra: { type: 'sun_guard' },
        }],
      });
      logger.log('[EnvironmentService] UV notification sent');
    } catch (error) {
      logger.error('[EnvironmentService] Failed to send UV notification:', error);
    }
  }

  /**
   * Schedule celebration notification for when tattoo is safe to submerge
   */
  async scheduleCelebrationNotification(tattooDate: string): Promise<void> {
    if (!this.isNative) return;

    const countdown = calculateSubmergeCountdown(tattooDate);
    if (countdown.isSafe || countdown.daysRemaining <= 0) {
      return; // Already safe, no need to schedule
    }

    try {
      const celebrationDate = new Date(countdown.safeDate);
      celebrationDate.setHours(10, 0, 0, 0); // 10 AM on the safe day

      // Only schedule if it's in the future
      if (celebrationDate > new Date()) {
        await LocalNotifications.schedule({
          notifications: [{
            id: CELEBRATION_NOTIFICATION_ID,
            title: '🎉 Safe to Submerge!',
            body: "Your tattoo has healed enough for swimming and gym activities. Enjoy!",
            schedule: { at: celebrationDate },
            sound: 'default',
            extra: { type: 'celebration' },
          }],
        });
        logger.log(`[EnvironmentService] Celebration notification scheduled for ${celebrationDate}`);
      }
    } catch (error) {
      logger.error('[EnvironmentService] Failed to schedule celebration:', error);
    }
  }

  /**
   * Cancel celebration notification
   */
  async cancelCelebrationNotification(): Promise<void> {
    if (!this.isNative) return;

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: CELEBRATION_NOTIFICATION_ID }],
      });
    } catch (error) {
      logger.error('[EnvironmentService] Failed to cancel celebration:', error);
    }
  }

  /**
   * Get the last UV check result (cached)
   */
  getLastUVCheck(): UVData | null {
    return this.lastUVCheck;
  }
}

export const environmentService = new EnvironmentService();
