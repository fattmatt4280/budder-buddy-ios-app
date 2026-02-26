import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { purchaseService } from '@/lib/purchaseService';
import type { PlanType } from '@/lib/purchaseService';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface PremiumStatus {
  isPro: boolean;
  isLoading: boolean;
  status: string;
  expiresAt: Date | null;
  purchase: (plan?: PlanType) => Promise<void>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePremiumStatus(userId: string | null): PremiumStatus {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('free');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setIsPro(false);
      setStatus('free');
      setIsLoading(false);
      return;
    }

    try {
      // Check admin role first — admins get full Pro access
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) {
        setIsPro(true);
        setStatus('admin');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('[Premium] Failed to fetch status:', error);
        setIsPro(false);
        setStatus('free');
      } else if (data) {
        const isActive = data.status === 'active' && 
          (!data.expires_at || new Date(data.expires_at) > new Date());
        setIsPro(isActive);
        setStatus(data.status);
        setExpiresAt(data.expires_at ? new Date(data.expires_at) : null);
      } else {
        setIsPro(false);
        setStatus('free');
      }
    } catch (err) {
      logger.error('[Premium] Error:', err);
      setIsPro(false);
      setStatus('free');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const purchase = useCallback(async (plan: PlanType = 'monthly') => {
    const result = await purchaseService.purchase(plan);
    if (result.success) {
      toast({ title: 'Welcome to Pro! 🎉', description: 'All premium features are now unlocked.' });
      await fetchStatus();
    } else {
      toast({ title: 'Purchase failed', description: result.error, variant: 'destructive' });
    }
  }, [fetchStatus, toast]);

  const restore = useCallback(async () => {
    const result = await purchaseService.restore();
    if (result.success) {
      toast({ title: 'Subscription restored!', description: 'Your Pro access has been restored.' });
      await fetchStatus();
    } else {
      toast({ title: 'No subscription found', description: result.error || 'No active subscription to restore.', variant: 'destructive' });
    }
  }, [fetchStatus, toast]);

  return { isPro, isLoading, status, expiresAt, purchase, restore, refresh: fetchStatus };
}
