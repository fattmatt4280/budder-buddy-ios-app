-- Create storage bucket for tattoo photos (private, requires auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tattoo-photos', 
  'tattoo-photos', 
  false,
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- RLS: Users can only access their own photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tattoo-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tattoo-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tattoo-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create photos table to track metadata (links to storage)
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tattoo_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for photos table
CREATE POLICY "Users can view their own photos"
ON public.photos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos"
ON public.photos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
ON public.photos FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
ON public.photos FOR UPDATE
USING (auth.uid() = user_id);