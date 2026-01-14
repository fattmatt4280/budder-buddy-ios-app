import { Capacitor } from '@capacitor/core';
import { secureStorageAdapter } from './secureStorageAdapter';

const SUPABASE_PROJECT_ID = 'ahakqntfpkbeblmljeib';
const AUTH_TOKEN_KEY = `sb-${SUPABASE_PROJECT_ID}-auth-token`;

/**
 * Initialize secure authentication storage
 * Migrates existing tokens from localStorage to secure storage on native platforms
 */
export async function initializeSecureAuth(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await migrateExistingTokens();
  }
}

/**
 * Migrate existing tokens from insecure localStorage to secure Keychain/Keystore
 * This runs once on first app launch after the update
 */
async function migrateExistingTokens(): Promise<void> {
  try {
    // Check if we have tokens in localStorage that need migration
    const existingSession = localStorage.getItem(AUTH_TOKEN_KEY);

    if (existingSession) {
      // Check if we already have it in secure storage
      const secureSession = await secureStorageAdapter.getItem(AUTH_TOKEN_KEY);
      
      if (!secureSession) {
        // Move to secure storage
        await secureStorageAdapter.setItem(AUTH_TOKEN_KEY, existingSession);
        console.log('[SecureAuth] Migrated auth tokens to secure storage');
      }
      
      // Remove from insecure storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      console.log('[SecureAuth] Removed tokens from insecure storage');
    }
  } catch (error) {
    console.error('[SecureAuth] Migration failed:', error);
    // Don't throw - allow app to continue even if migration fails
  }
}

/**
 * Clear all auth data from both secure and insecure storage
 * Call this on logout to ensure complete cleanup
 */
export async function clearAuthStorage(): Promise<void> {
  try {
    await secureStorageAdapter.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[SecureAuth] Failed to clear auth storage:', error);
  }
}
