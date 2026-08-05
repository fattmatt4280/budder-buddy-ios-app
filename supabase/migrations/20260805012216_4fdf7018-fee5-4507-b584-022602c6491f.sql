-- Create beta_feedback table (daily in-app feedback prompt during beta testing)
CREATE TABLE public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('up', 'down')),
  message TEXT,
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own beta feedback"
  ON public.beta_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own beta feedback"
  ON public.beta_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
