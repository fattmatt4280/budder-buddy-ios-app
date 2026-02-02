-- Create user_tattoos table
CREATE TABLE public.user_tattoos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL,
  tattoo_date DATE NOT NULL,
  body_location TEXT NOT NULL,
  size_tier TEXT NOT NULL,
  ink_type TEXT NOT NULL,
  artist_name TEXT,
  shop_name TEXT,
  notes TEXT,
  is_healed BOOLEAN DEFAULT FALSE,
  healed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, local_id)
);

-- Create user_settings table (one row per user)
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_checkins table
CREATE TABLE public.user_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tattoo_local_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  checkin_date DATE NOT NULL,
  checklist JSONB NOT NULL,
  user_notes TEXT,
  observations TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tattoo_local_id, day_number)
);

-- Enable RLS on all tables
ALTER TABLE public.user_tattoos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_tattoos
CREATE POLICY "Users can view their own tattoos"
  ON public.user_tattoos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tattoos"
  ON public.user_tattoos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tattoos"
  ON public.user_tattoos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tattoos"
  ON public.user_tattoos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for user_checkins
CREATE POLICY "Users can view their own checkins"
  ON public.user_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
  ON public.user_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
  ON public.user_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
  ON public.user_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_user_tattoos_updated_at
  BEFORE UPDATE ON public.user_tattoos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();