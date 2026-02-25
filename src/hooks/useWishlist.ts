import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface WishlistItem {
  id: string;
  title: string;
  bodyLocation?: string;
  style?: string;
  artistName?: string;
  shopName?: string;
  budget?: number;
  notes?: string;
  referenceUrl?: string;
  sortOrder: number;
  createdAt: string;
}

export function useWishlist(userId: string | null) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tattoo_wishlist')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setItems(
        (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          bodyLocation: row.body_location,
          style: row.style,
          artistName: row.artist_name,
          shopName: row.shop_name,
          budget: row.budget ? Number(row.budget) : undefined,
          notes: row.notes,
          referenceUrl: row.reference_url,
          sortOrder: row.sort_order,
          createdAt: row.created_at,
        }))
      );
    } catch (err) {
      logger.error('[Wishlist] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(
    async (item: Omit<WishlistItem, 'id' | 'sortOrder' | 'createdAt'>) => {
      if (!userId) return;

      const { error } = await supabase.from('tattoo_wishlist').insert({
        user_id: userId,
        title: item.title,
        body_location: item.bodyLocation || null,
        style: item.style || null,
        artist_name: item.artistName || null,
        shop_name: item.shopName || null,
        budget: item.budget || null,
        notes: item.notes || null,
        reference_url: item.referenceUrl || null,
        sort_order: items.length,
      });

      if (error) {
        logger.error('[Wishlist] Insert error:', error);
        throw error;
      }
      await fetchItems();
    },
    [userId, items.length, fetchItems]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<WishlistItem>) => {
      if (!userId) return;

      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.bodyLocation !== undefined) dbUpdates.body_location = updates.bodyLocation;
      if (updates.style !== undefined) dbUpdates.style = updates.style;
      if (updates.artistName !== undefined) dbUpdates.artist_name = updates.artistName;
      if (updates.shopName !== undefined) dbUpdates.shop_name = updates.shopName;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.referenceUrl !== undefined) dbUpdates.reference_url = updates.referenceUrl;

      const { error } = await supabase
        .from('tattoo_wishlist')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('[Wishlist] Update error:', error);
        throw error;
      }
      await fetchItems();
    },
    [userId, fetchItems]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!userId) return;

      const { error } = await supabase
        .from('tattoo_wishlist')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('[Wishlist] Delete error:', error);
        throw error;
      }
      await fetchItems();
    },
    [userId, fetchItems]
  );

  return { items, isLoading, addItem, updateItem, deleteItem, refresh: fetchItems };
}
