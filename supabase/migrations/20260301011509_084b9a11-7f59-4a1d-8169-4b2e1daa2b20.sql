
-- Create wishlist_images table
CREATE TABLE public.wishlist_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_item_id uuid NOT NULL REFERENCES public.tattoo_wishlist(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  storage_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishlist_images ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own wishlist images"
  ON public.wishlist_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist images"
  ON public.wishlist_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist images"
  ON public.wishlist_images FOR DELETE
  USING (auth.uid() = user_id);

-- Migrate existing image_path data into new table
INSERT INTO public.wishlist_images (wishlist_item_id, user_id, storage_path, sort_order)
SELECT id, user_id, image_path, 0
FROM public.tattoo_wishlist
WHERE image_path IS NOT NULL;
