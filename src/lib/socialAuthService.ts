import { Capacitor, registerPlugin } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface SocialAuthPlugin {
  signInWithApple(): Promise<{
    idToken?: string;
    nonce?: string;
    user?: string;
    email?: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
    cancelled?: boolean;
  }>;
  signInWithGoogle(options: { clientId: string }): Promise<{
    idToken?: string;
    accessToken?: string;
    email?: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
    cancelled?: boolean;
  }>;
}

const SocialAuth = registerPlugin<SocialAuthPlugin>('SocialAuth');

const isNative = Capacitor.isNativePlatform();

const GOOGLE_IOS_CLIENT_ID = '758862592689-60e6fvb72pqu0117m6tbg59el6gbtg5l.apps.googleusercontent.com';

export const socialAuthService = {
  /**
   * Sign in with Apple using native ASAuthorizationController.
   * Falls back to Supabase OAuth redirect on web.
   */
  async signInWithApple(): Promise<{
    success: boolean;
    cancelled?: boolean;
    error?: string;
  }> {
    if (!isNative) {
      return this._webAppleSignIn();
    }

    try {
      const result = await SocialAuth.signInWithApple();

      if (result.cancelled) {
        return { success: false, cancelled: true };
      }

      if (!result.idToken || !result.nonce) {
        return { success: false, error: 'Failed to get Apple credentials' };
      }

      logger.log('[socialAuth] Exchanging Apple token with Supabase');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.idToken,
        nonce: result.nonce,
      });

      if (error) {
        logger.error('[socialAuth] Apple token exchange failed:', error);
        return { success: false, error: error.message };
      }

      // Update user metadata with display name if available (Apple only sends on first sign-in)
      if (result.displayName && data.user) {
        await supabase.auth.updateUser({
          data: { display_name: result.displayName },
        });
      }

      logger.log('[socialAuth] Apple sign-in successful');
      return { success: true };
    } catch (err) {
      logger.error('[socialAuth] Apple sign-in error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Apple Sign-In failed',
      };
    }
  },

  /**
   * Sign in with Google using native GIDSignIn SDK.
   * Falls back to Supabase OAuth redirect on web.
   */
  async signInWithGoogle(): Promise<{
    success: boolean;
    cancelled?: boolean;
    error?: string;
  }> {
    if (!isNative) {
      return this._webGoogleSignIn();
    }

    try {
      const result = await SocialAuth.signInWithGoogle({
        clientId: GOOGLE_IOS_CLIENT_ID,
      });

      if (result.cancelled) {
        return { success: false, cancelled: true };
      }

      if (!result.idToken) {
        return { success: false, error: 'Failed to get Google credentials' };
      }

      logger.log('[socialAuth] Exchanging Google token with Supabase');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.idToken,
        access_token: result.accessToken,
      });

      if (error) {
        logger.error('[socialAuth] Google token exchange failed:', error.message, error);
        return { success: false, error: `Google sign-in error: ${error.message}` };
      }

      // Update user metadata with display name
      if (result.displayName && data.user) {
        await supabase.auth.updateUser({
          data: { display_name: result.displayName },
        });
      }

      logger.log('[socialAuth] Google sign-in successful');
      return { success: true };
    } catch (err) {
      logger.error('[socialAuth] Google sign-in error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Google Sign-In failed',
      };
    }
  },

  /**
   * Web fallback for Apple Sign-In using Supabase OAuth redirect.
   */
  async _webAppleSignIn(): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * Web fallback for Google Sign-In using Supabase OAuth redirect.
   */
  async _webGoogleSignIn(): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
