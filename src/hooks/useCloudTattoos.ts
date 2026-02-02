import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tattoo } from '@/types';
import { logger } from '@/lib/logger';

const LOCAL_STORAGE_KEY = 'budder_tattoos';

function getLocalTattoos(): Tattoo[] {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function setLocalTattoos(tattoos: Tattoo[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tattoos));
  } catch (error) {
    logger.error('Failed to save tattoos to local storage:', error);
  }
}

interface CloudTattoo {
  id: string;
  user_id: string;
  local_id: string;
  tattoo_date: string;
  body_location: string;
  size_tier: string;
  ink_type: string;
  artist_name: string | null;
  shop_name: string | null;
  notes: string | null;
  is_healed: boolean | null;
  healed_date: string | null;
  created_at: string;
  updated_at: string;
}

function cloudToLocal(cloud: CloudTattoo): Tattoo {
  return {
    id: cloud.local_id,
    createdAt: cloud.created_at,
    tattooDate: cloud.tattoo_date,
    bodyLocation: cloud.body_location,
    sizeTier: cloud.size_tier as Tattoo['sizeTier'],
    inkType: cloud.ink_type as Tattoo['inkType'],
    artistName: cloud.artist_name ?? undefined,
    shopName: cloud.shop_name ?? undefined,
    notes: cloud.notes ?? undefined,
    isHealed: cloud.is_healed ?? undefined,
    healedDate: cloud.healed_date ?? undefined,
  };
}

function localToCloud(local: Tattoo, userId: string): Omit<CloudTattoo, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    local_id: local.id,
    tattoo_date: local.tattooDate,
    body_location: local.bodyLocation,
    size_tier: local.sizeTier,
    ink_type: local.inkType,
    artist_name: local.artistName ?? null,
    shop_name: local.shopName ?? null,
    notes: local.notes ?? null,
    is_healed: local.isHealed ?? false,
    healed_date: local.healedDate ?? null,
  };
}

export function useCloudTattoos(userId: string | null) {
  const [tattoos, setTattoos] = useState<Tattoo[]>(() => getLocalTattoos());
  const [isLoading, setIsLoading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Fetch from cloud and merge/import local data
  useEffect(() => {
    if (!userId || hasSynced) return;

    const syncFromCloud = async () => {
      setIsLoading(true);
      try {
        // Fetch cloud tattoos
        const { data: cloudData, error } = await supabase
          .from('user_tattoos')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          logger.error('Failed to fetch cloud tattoos:', error);
          setIsLoading(false);
          return;
        }

        const cloudTattoos = (cloudData || []).map(cloudToLocal);
        const localTattoos = getLocalTattoos();

        if (cloudTattoos.length === 0 && localTattoos.length > 0) {
          // Cloud is empty but local has data - import to cloud
          logger.log('Importing local tattoos to cloud:', localTattoos.length);
          
          const toInsert = localTattoos.map(t => localToCloud(t, userId));
          const { error: insertError } = await supabase
            .from('user_tattoos')
            .insert(toInsert);

          if (insertError) {
            logger.error('Failed to import tattoos to cloud:', insertError);
          } else {
            logger.log('Successfully imported tattoos to cloud');
          }
          // Keep using local tattoos
          setTattoos(localTattoos);
        } else if (cloudTattoos.length > 0) {
          // Use cloud data as source of truth
          setTattoos(cloudTattoos);
          setLocalTattoos(cloudTattoos);
        }

        setHasSynced(true);
      } catch (err) {
        logger.error('Error syncing tattoos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    syncFromCloud();
  }, [userId, hasSynced]);

  // Persist to local storage whenever tattoos change
  useEffect(() => {
    if (hasSynced) {
      setLocalTattoos(tattoos);
    }
  }, [tattoos, hasSynced]);

  const addTattoo = useCallback(async (tattoo: Tattoo) => {
    // Add locally first for immediate feedback
    setTattoos(prev => [...prev, tattoo]);

    // Then sync to cloud if authenticated
    if (userId) {
      const cloudData = localToCloud(tattoo, userId);
      const { error } = await supabase
        .from('user_tattoos')
        .insert(cloudData);

      if (error) {
        logger.error('Failed to save tattoo to cloud:', error);
      }
    }
  }, [userId]);

  const updateTattoo = useCallback(async (id: string, updates: Partial<Tattoo>) => {
    setTattoos(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );

    if (userId) {
      const updateData: Record<string, unknown> = {};
      if (updates.tattooDate !== undefined) updateData.tattoo_date = updates.tattooDate;
      if (updates.bodyLocation !== undefined) updateData.body_location = updates.bodyLocation;
      if (updates.sizeTier !== undefined) updateData.size_tier = updates.sizeTier;
      if (updates.inkType !== undefined) updateData.ink_type = updates.inkType;
      if (updates.artistName !== undefined) updateData.artist_name = updates.artistName;
      if (updates.shopName !== undefined) updateData.shop_name = updates.shopName;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.isHealed !== undefined) updateData.is_healed = updates.isHealed;
      if (updates.healedDate !== undefined) updateData.healed_date = updates.healedDate;

      const { error } = await supabase
        .from('user_tattoos')
        .update(updateData)
        .eq('user_id', userId)
        .eq('local_id', id);

      if (error) {
        logger.error('Failed to update tattoo in cloud:', error);
      }
    }
  }, [userId]);

  const deleteTattoo = useCallback(async (id: string) => {
    setTattoos(prev => prev.filter(t => t.id !== id));

    if (userId) {
      const { error } = await supabase
        .from('user_tattoos')
        .delete()
        .eq('user_id', userId)
        .eq('local_id', id);

      if (error) {
        logger.error('Failed to delete tattoo from cloud:', error);
      }
    }
  }, [userId]);

  const getTattoo = useCallback(
    (id: string) => tattoos.find(t => t.id === id),
    [tattoos]
  );

  return {
    tattoos,
    addTattoo,
    updateTattoo,
    deleteTattoo,
    getTattoo,
    isLoading,
    hasSynced,
  };
}
