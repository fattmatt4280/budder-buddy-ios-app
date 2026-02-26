
-- Add image_path column to tattoo_wishlist
ALTER TABLE public.tattoo_wishlist ADD COLUMN image_path text DEFAULT NULL;

-- Create wishlist-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('wishlist-images', 'wishlist-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for wishlist-images
CREATE POLICY "Users can upload wishlist images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wishlist-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own wishlist images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'wishlist-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own wishlist images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'wishlist-images' AND (storage.foldername(name))[1] = auth.uid()::text);
