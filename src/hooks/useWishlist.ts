import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface WishlistImage {
  id: string;
  storagePath: string;
  url?: string;
}

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
  images: WishlistImage[];
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
      // Fetch wishlist items
      const { data, error } = await supabase
        .from('tattoo_wishlist')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Fetch all images for this user's wishlist items
      const itemIds = (data || []).map((r: any) => r.id);
      let imagesMap: Record<string, WishlistImage[]> = {};

      if (itemIds.length > 0) {
        const { data: imgData, error: imgError } = await supabase
          .from('wishlist_images')
          .select('*')
          .in('wishlist_item_id', itemIds)
          .order('sort_order', { ascending: true });

        if (imgError) throw imgError;

        // Generate signed URLs in batch
        const imgRows = imgData || [];
        const signedResults = await Promise.all(
          imgRows.map(async (img: any) => {
            const { data: urlData } = await supabase.storage
              .from('wishlist-images')
              .createSignedUrl(img.storage_path, 3600);
            return {
              id: img.id,
              wishlistItemId: img.wishlist_item_id,
              storagePath: img.storage_path,
              url: urlData?.signedUrl,
            };
          })
        );

        for (const img of signedResults) {
          if (!imagesMap[img.wishlistItemId]) imagesMap[img.wishlistItemId] = [];
          imagesMap[img.wishlistItemId].push({
            id: img.id,
            storagePath: img.storagePath,
            url: img.url,
          });
        }
      }

      const rows = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        bodyLocation: row.body_location,
        style: row.style,
        artistName: row.artist_name,
        shopName: row.shop_name,
        budget: row.budget ? Number(row.budget) : undefined,
        notes: row.notes,
        referenceUrl: row.reference_url,
        images: imagesMap[row.id] || [],
        sortOrder: row.sort_order,
        createdAt: row.created_at,
      }));

      setItems(rows);
    } catch (err) {
      logger.error('[Wishlist] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      if (!userId) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from('wishlist-images')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        logger.error('[Wishlist] Upload error:', error);
        throw error;
      }
      return path;
    },
    [userId]
  );

  const addItem = useCallback(
    async (
      item: Omit<WishlistItem, 'id' | 'sortOrder' | 'createdAt' | 'images'>,
      imageFiles?: File[]
    ) => {
      if (!userId) return;

      // Insert the wishlist item
      const { data: inserted, error } = await supabase
        .from('tattoo_wishlist')
        .insert({
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
        })
        .select('id')
        .single();

      if (error) {
        logger.error('[Wishlist] Insert error:', error);
        throw error;
      }

      // Upload images and create image records
      if (imageFiles && imageFiles.length > 0 && inserted) {
        const uploads = await Promise.all(
          imageFiles.map(async (file, idx) => {
            const storagePath = await uploadImage(file);
            return { storagePath, sortOrder: idx };
          })
        );

        const { error: imgError } = await supabase.from('wishlist_images').insert(
          uploads.map((u) => ({
            wishlist_item_id: inserted.id,
            user_id: userId,
            storage_path: u.storagePath,
            sort_order: u.sortOrder,
          }))
        );

        if (imgError) {
          logger.error('[Wishlist] Image insert error:', imgError);
        }
      }

      await fetchItems();
    },
    [userId, items.length, fetchItems, uploadImage]
  );

  const addImages = useCallback(
    async (itemId: string, files: File[]) => {
      if (!userId || files.length === 0) return;

      // Get current max sort_order for this item
      const item = items.find((i) => i.id === itemId);
      const maxSort = item?.images.length || 0;

      const uploads = await Promise.all(
        files.map(async (file, idx) => {
          const storagePath = await uploadImage(file);
          return { storagePath, sortOrder: maxSort + idx };
        })
      );

      const { error } = await supabase.from('wishlist_images').insert(
        uploads.map((u) => ({
          wishlist_item_id: itemId,
          user_id: userId,
          storage_path: u.storagePath,
          sort_order: u.sortOrder,
        }))
      );

      if (error) {
        logger.error('[Wishlist] Add images error:', error);
        throw error;
      }
      await fetchItems();
    },
    [userId, items, fetchItems, uploadImage]
  );

  const removeImage = useCallback(
    async (imageId: string) => {
      if (!userId) return;

      // Find image to clean up storage
      const image = items.flatMap((i) => i.images).find((img) => img.id === imageId);
      if (image?.storagePath) {
        await supabase.storage.from('wishlist-images').remove([image.storagePath]);
      }

      const { error } = await supabase
        .from('wishlist_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId);

      if (error) {
        logger.error('[Wishlist] Remove image error:', error);
        throw error;
      }
      await fetchItems();
    },
    [userId, items, fetchItems]
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

      // Clean up all images from storage
      const item = items.find((i) => i.id === id);
      if (item?.images.length) {
        const paths = item.images.map((img) => img.storagePath);
        await supabase.storage.from('wishlist-images').remove(paths);
      }

      // CASCADE will handle wishlist_images rows
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
    [userId, fetchItems, items]
  );

  return { items, isLoading, addItem, updateItem, deleteItem, addImages, removeImage, uploadImage, refresh: fetchItems };
}
