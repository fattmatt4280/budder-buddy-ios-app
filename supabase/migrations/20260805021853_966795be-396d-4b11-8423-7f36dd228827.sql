CREATE TABLE public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('up', 'down')),
  message TEXT,
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.beta_feedback TO authenticated;
GRANT ALL ON public.beta_feedback TO service_role;

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own beta feedback"
  ON public.beta_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own beta feedback"
  ON public.beta_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);