
-- Wishlist table for next tattoo planning (Pro feature)
CREATE TABLE public.tattoo_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body_location TEXT,
  style TEXT,
  artist_name TEXT,
  shop_name TEXT,
  budget NUMERIC,
  notes TEXT,
  reference_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tattoo_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist" ON public.tattoo_wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist" ON public.tattoo_wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist" ON public.tattoo_wishlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist" ON public.tattoo_wishlist
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_tattoo_wishlist_updated_at
  BEFORE UPDATE ON public.tattoo_wishlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
