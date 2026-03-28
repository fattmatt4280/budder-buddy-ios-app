import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

export interface CloudPhoto {
  id: string;
  tattooId: string;
  dayNumber: number;
  date: string;
  storagePath: string;
  caption?: string;
  imageUrl?: string; // Signed URL for display
}

export function useCloudPhotos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<CloudPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch photos from database
  const fetchPhotos = useCallback(async () => {
    if (!user) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    try {
      logger.log('Fetching photos for user:', user.id);

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      logger.log('Fetched', data?.length ?? 0, 'photos from database');

      // Generate signed URLs for each photo
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: urlData } = await supabase.storage
            .from('tattoo-photos')
            .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

          return {
            id: photo.id,
            tattooId: photo.tattoo_id,
            dayNumber: photo.day_number,
            date: photo.photo_date,
            storagePath: photo.storage_path,
            caption: photo.caption || undefined,
            imageUrl: urlData?.signedUrl,
          };
        })
      );

      setPhotos(photosWithUrls);
    } catch (err) {
      logger.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Upload photo to storage and create database record
  const uploadPhoto = useCallback(
    async (
      file: File,
      tattooId: string,
      dayNumber: number,
      caption?: string
    ): Promise<{ success: boolean; error?: string }> => {
      // Get the current session directly from Supabase to avoid stale closure issues
      // (the hook's `user` state may not be set yet if Keychain read is slow)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        logger.error('Upload failed: no active session found');
        return { success: false, error: 'You must be logged in to save photos' };
      }

      try {
        // Create unique filename
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${currentUser.id}/${tattooId}/${Date.now()}.${fileExt}`;

        logger.log('Uploading photo:', { fileName, fileSize: file.size, tattooId, dayNumber });

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('tattoo-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          logger.error('Storage upload failed:', uploadError);
          throw uploadError;
        }

        logger.log('Storage upload succeeded, creating DB record...');

        // Create database record
        const { data: photoRecord, error: dbError } = await supabase
          .from('photos')
          .insert({
            user_id: currentUser.id,
            tattoo_id: tattooId,
            day_number: dayNumber,
            storage_path: fileName,
            photo_date: new Date().toISOString(),
            caption: caption || null,
          })
          .select()
          .single();

        if (dbError) {
          logger.error('DB insert failed:', dbError);
          throw dbError;
        }

        logger.log('Photo record created:', photoRecord.id);

        // Generate signed URL for immediate display
        const { data: urlData } = await supabase.storage
          .from('tattoo-photos')
          .createSignedUrl(fileName, 3600);

        // Add to local state
        setPhotos((prev) => [
          {
            id: photoRecord.id,
            tattooId: photoRecord.tattoo_id,
            dayNumber: photoRecord.day_number,
            date: photoRecord.photo_date,
            storagePath: photoRecord.storage_path,
            caption: photoRecord.caption || undefined,
            imageUrl: urlData?.signedUrl,
          },
          ...prev,
        ]);

        return { success: true };
      } catch (err) {
        logger.error('Error uploading photo:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to upload photo',
        };
      }
    },
    []
  );

  // Delete photo from storage and database
  const deletePhoto = useCallback(
    async (photoId: string): Promise<{ success: boolean; error?: string }> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'You must be logged in' };
      }

      try {
        const photo = photos.find((p) => p.id === photoId);
        if (!photo) {
          return { success: false, error: 'Photo not found' };
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('tattoo-photos')
          .remove([photo.storagePath]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
          .from('photos')
          .delete()
          .eq('id', photoId);

        if (dbError) throw dbError;

        // Remove from local state
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));

        return { success: true };
      } catch (err) {
        logger.error('Error deleting photo:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete photo',
        };
      }
    },
    [user, photos]
  );

  // Get photos for a specific tattoo
  const getPhotosForTattoo = useCallback(
    (tattooId: string) => {
      return photos
        .filter((p) => p.tattooId === tattooId)
        .sort((a, b) => b.dayNumber - a.dayNumber);
    },
    [photos]
  );

  return {
    photos,
    loading,
    uploadPhoto,
    deletePhoto,
    getPhotosForTattoo,
    refetch: fetchPhotos,
  };
}
