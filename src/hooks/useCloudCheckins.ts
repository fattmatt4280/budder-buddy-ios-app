// @refresh reset
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DailyCheckin, DailyChecklist } from '@/types';
import { logger } from '@/lib/logger';

const LOCAL_STORAGE_KEY = 'budder_checkins';

function getLocalCheckins(): DailyCheckin[] {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function setLocalCheckins(checkins: DailyCheckin[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checkins));
  } catch (error) {
    logger.error('Failed to save checkins to local storage:', error);
  }
}

interface CloudCheckin {
  id: string;
  user_id: string;
  tattoo_local_id: string;
  day_number: number;
  checkin_date: string;
  checklist: Record<string, boolean>;
  user_notes: string | null;
  observations: string[] | null;
  created_at: string;
}

function cloudToLocal(cloud: CloudCheckin): DailyCheckin {
  return {
    id: cloud.id,
    tattooId: cloud.tattoo_local_id,
    dayNumber: cloud.day_number,
    date: cloud.checkin_date,
    checklist: cloud.checklist as unknown as DailyChecklist,
    userNotes: cloud.user_notes ?? undefined,
    observations: cloud.observations ?? undefined,
  };
}

function localToCloud(local: DailyCheckin, userId: string): Omit<CloudCheckin, 'id' | 'created_at'> {
  return {
    user_id: userId,
    tattoo_local_id: local.tattooId,
    day_number: local.dayNumber,
    checkin_date: local.date,
    checklist: local.checklist as unknown as Record<string, boolean>,
    user_notes: local.userNotes ?? null,
    observations: local.observations ?? null,
  };
}

export function useCloudCheckins(userId: string | null) {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
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
    setCheckins([]);
    setHasSynced(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [userId]);

  // Fetch from cloud and merge/import local data
  useEffect(() => {
    if (!userId || hasSynced) return;

    const syncFromCloud = async () => {
      setIsLoading(true);
      try {
        const { data: cloudData, error } = await supabase
          .from('user_checkins')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          logger.error('Failed to fetch cloud checkins:', error);
          setIsLoading(false);
          return;
        }

        const cloudCheckins = (cloudData || []).map(cloudToLocal);
        const localCheckins = getLocalCheckins();

        if (cloudCheckins.length === 0 && localCheckins.length > 0) {
          // Cloud is empty but local has data - import to cloud
          logger.log('Importing local checkins to cloud:', localCheckins.length);
          
          const toInsert = localCheckins.map(c => localToCloud(c, userId));
          const { error: insertError } = await supabase
            .from('user_checkins')
            .insert(toInsert);

          if (insertError) {
            logger.error('Failed to import checkins to cloud:', insertError);
          } else {
            logger.log('Successfully imported checkins to cloud');
          }
          setCheckins(localCheckins);
        } else if (cloudCheckins.length > 0) {
          // Use cloud data as source of truth
          setCheckins(cloudCheckins);
          setLocalCheckins(cloudCheckins);
        }

        setHasSynced(true);
      } catch (err) {
        logger.error('Error syncing checkins:', err);
      } finally {
        setIsLoading(false);
      }
    };

    syncFromCloud();
  }, [userId, hasSynced]);

  // Persist to local storage whenever checkins change
  useEffect(() => {
    if (hasSynced) {
      setLocalCheckins(checkins);
    }
  }, [checkins, hasSynced]);

  const addCheckin = useCallback(async (checkin: DailyCheckin) => {
    setCheckins(prev => [...prev, checkin]);

    // Get current session directly to avoid stale userId closure
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (currentUserId) {
      const cloudData = localToCloud(checkin, currentUserId);
      const { error } = await supabase
        .from('user_checkins')
        .insert(cloudData);

      if (error) {
        logger.error('Failed to save checkin to cloud:', error);
      } else {
        logger.log('Checkin saved to cloud:', checkin.id);
      }
    } else {
      logger.error('addCheckin: no active session, checkin only saved locally');
    }
  }, []);

  const updateCheckin = useCallback(async (id: string, updates: Partial<DailyCheckin>) => {
    setCheckins(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );

    // Get current session directly to avoid stale userId closure
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (currentUserId) {
      const updateData: Record<string, unknown> = {};
      if (updates.checklist !== undefined) updateData.checklist = updates.checklist;
      if (updates.userNotes !== undefined) updateData.user_notes = updates.userNotes;
      if (updates.observations !== undefined) updateData.observations = updates.observations;

      const { error } = await supabase
        .from('user_checkins')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (error) {
        logger.error('Failed to update checkin in cloud:', error);
      }
    } else {
      logger.error('updateCheckin: no active session, update only saved locally');
    }
  }, []);

  const getCheckinForDay = useCallback(
    (tattooId: string, dayNumber: number) =>
      checkins.find(c => c.tattooId === tattooId && c.dayNumber === dayNumber),
    [checkins]
  );

  const getCheckinsForTattoo = useCallback(
    (tattooId: string) => checkins.filter(c => c.tattooId === tattooId),
    [checkins]
  );

  return {
    checkins,
    addCheckin,
    updateCheckin,
    getCheckinForDay,
    getCheckinsForTattoo,
    isLoading,
    hasSynced,
  };
}
