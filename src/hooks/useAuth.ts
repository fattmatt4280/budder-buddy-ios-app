import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { clearAuthStorage } from '@/lib/supabaseClientInit';
import { purchaseService } from '@/lib/purchaseService';
import { socialAuthService } from '@/lib/socialAuthService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Identify or reset RevenueCat user
        if (session?.user) {
          purchaseService.identify(session.user.id);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });

    return { data, error };
  }, []);

  // Starts a real (but anonymous) Supabase session so a brand-new user gets a
  // genuine user_id before they've created an account — tattoos/photos/checkins
  // added during onboarding go straight to the cloud like any other user's,
  // instead of needing a separate local-only code path. No-ops if a session
  // (anonymous or real) already exists.
  const signInAnonymously = useCallback(async () => {
    const { data: { session: existing } } = await supabase.auth.getSession();
    if (existing) return { data: { session: existing, user: existing.user }, error: null };

    const { data, error } = await supabase.auth.signInAnonymously();
    return { data, error };
  }, []);

  // Converts the current anonymous session into a real account by attaching
  // an email/password identity to the SAME user id — every tattoo/photo/
  // checkin/setting already saved under that id stays put, no migration.
  const upgradeAnonymousAccount = useCallback(async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
      data: displayName ? { display_name: displayName } : undefined,
    });

    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    await purchaseService.logout();
    await clearAuthStorage();
    return { error };
  }, []);

  const signInWithApple = useCallback(async () => {
    const result = await socialAuthService.signInWithApple();
    if (!result.success && !result.cancelled) {
      return { error: { message: result.error || 'Apple Sign-In failed' }, cancelled: false };
    }
    if (result.cancelled) {
      return { error: null, cancelled: true };
    }
    return { error: null, cancelled: false };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await socialAuthService.signInWithGoogle();
    if (!result.success && !result.cancelled) {
      return { error: { message: result.error || 'Google Sign-In failed' }, cancelled: false };
    }
    if (result.cancelled) {
      return { error: null, cancelled: true };
    }
    return { error: null, cancelled: false };
  }, []);

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithApple,
    signInWithGoogle,
    signInAnonymously,
    upgradeAnonymousAccount,
    isAuthenticated: !!session,
    // True for a session created by signInAnonymously() that hasn't had an
    // email/password identity attached yet via upgradeAnonymousAccount().
    isAnonymous: !!user?.is_anonymous,
  };
}
