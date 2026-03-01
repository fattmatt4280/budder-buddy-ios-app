import { useState, useEffect, useCallback, useRef } from 'react';
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
  name: string | null;
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
    name: cloud.name ?? undefined,
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
    name: local.name ?? null,
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
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // Reset state when userId actually changes (not on HMR remount)
  useEffect(() => {
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = userId;
      return;
    }
    if (prevUserIdRef.current === userId) return;
    prevUserIdRef.current = userId;
    setTattoos([]);
    setHasSynced(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [userId]);

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

        logger.log('[useCloudTattoos] sync start', {
          userId,
          cloudCount: cloudTattoos.length,
          localCount: localTattoos.length,
        });

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
        } else if (cloudTattoos.length === 0 && localTattoos.length === 0) {
          // Both cloud and local are empty, but photos might exist (photos are always cloud-backed).
          // Recover tattoo stubs from distinct photo tattoo_ids so photos become visible.
          const { data: photoRows, error: photoErr } = await supabase
            .from('photos')
            .select('tattoo_id, photo_date')
            .eq('user_id', userId)
            .order('photo_date', { ascending: true });

          if (photoErr) {
            logger.error('Failed to recover tattoos from photos:', photoErr);
          } else {
            const distinct = new Map<string, string>();
            for (const row of photoRows || []) {
              if (!distinct.has(row.tattoo_id)) {
                distinct.set(row.tattoo_id, row.photo_date);
              }
            }

            if (distinct.size > 0) {
              logger.log('Recovering tattoo stubs from photos:', distinct.size);
              const toInsert = Array.from(distinct.entries()).map(([localId, firstPhotoDate]) => ({
                user_id: userId,
                local_id: localId,
                tattoo_date: firstPhotoDate,
                body_location: 'Other',
                size_tier: 'Medium',
                ink_type: 'BlackGrey',
                notes: 'Recovered from photos - please update details',
                is_healed: false,
              }));

              // Types may not be regenerated yet, so assert to any
              const { error: insertErr } = await (supabase.from('user_tattoos') as any).insert(toInsert);
              if (insertErr) {
                logger.error('Failed to insert recovered tattoos:', insertErr);
              }

              // Fetch again after recovery
              const { data: recoveredData, error: recoveredErr } = await supabase
                .from('user_tattoos')
                .select('*')
                .eq('user_id', userId);

              if (recoveredErr) {
                logger.error('Failed to fetch recovered tattoos:', recoveredErr);
              } else {
                const recoveredTattoos = (recoveredData || []).map(cloudToLocal);
                setTattoos(recoveredTattoos);
                setLocalTattoos(recoveredTattoos);
              }
            }
          }
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
      if (updates.name !== undefined) updateData.name = updates.name;
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
