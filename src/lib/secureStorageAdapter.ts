import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Secure Storage Adapter for Supabase Auth
 * Uses iOS Keychain / Android Keystore on native platforms
 * Falls back to localStorage on web
 */
class SecureStorageAdapter {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isNative) {
      try {
        const result = await SecureStoragePlugin.get({ key });
        return result.value;
      } catch {
        // Key doesn't exist in secure storage
        return null;
      }
    }
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isNative) {
      await SecureStoragePlugin.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.isNative) {
      try {
        await SecureStoragePlugin.remove({ key });
      } catch {
        // Key might not exist, ignore error
      }
    } else {
      localStorage.removeItem(key);
    }
  }
}

export const secureStorageAdapter = new SecureStorageAdapter();
