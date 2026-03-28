import { Capacitor, registerPlugin } from '@capacitor/core';
import { secureStorageAdapter } from './secureStorageAdapter';

interface BiometricAuthPlugin {
  checkAvailability(): Promise<{ available: boolean; biometryType: 'faceId' | 'touchId' | 'none' }>;
  authenticate(options: { reason: string }): Promise<{ success: boolean; error?: string }>;
}

const BiometricAuth = registerPlugin<BiometricAuthPlugin>('BiometricAuth');

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const isNative = Capacitor.isNativePlatform();

export type BiometryType = 'faceId' | 'touchId' | 'none';

export const biometricService = {
  /**
   * Check if biometric authentication is available on this device.
   */
  async isAvailable(): Promise<boolean> {
    if (!isNative) return false;
    try {
      const result = await BiometricAuth.checkAvailability();
      return result.available;
    } catch {
      return false;
    }
  },

  /**
   * Get the type of biometric available (faceId, touchId, or none).
   */
  async getBiometryType(): Promise<BiometryType> {
    if (!isNative) return 'none';
    try {
      const result = await BiometricAuth.checkAvailability();
      return result.biometryType;
    } catch {
      return 'none';
    }
  },

  /**
   * Get a human-readable label for the current biometry type.
   */
  async getBiometryLabel(): Promise<string> {
    const type = await this.getBiometryType();
    switch (type) {
      case 'faceId': return 'Face ID';
      case 'touchId': return 'Touch ID';
      default: return 'Biometric';
    }
  },

  /**
   * Trigger biometric authentication (Face ID / Touch ID prompt).
   */
  async authenticate(reason?: string): Promise<{ success: boolean; error?: string }> {
    if (!isNative) return { success: false, error: 'Not available on web' };
    try {
      return await BiometricAuth.authenticate({
        reason: reason ?? 'Sign in to Budder Buddy',
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  },

  /**
   * Check if the user has opted in to biometric login.
   */
  async isEnabled(): Promise<boolean> {
    try {
      const value = await secureStorageAdapter.getItem(BIOMETRIC_ENABLED_KEY);
      return value === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Enable or disable biometric login preference.
   */
  async setEnabled(enabled: boolean): Promise<void> {
    if (enabled) {
      await secureStorageAdapter.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    } else {
      await secureStorageAdapter.removeItem(BIOMETRIC_ENABLED_KEY);
    }
  },
};
