CREATE TABLE public.user_attribution (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  landing_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  captured_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.user_attribution TO authenticated;
GRANT ALL ON public.user_attribution TO service_role;

ALTER TABLE public.user_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record their own first-touch attribution"
  ON public.user_attribution FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages attribution"
  ON public.user_attribution FOR ALL
  USING (auth.role() = 'service_role');