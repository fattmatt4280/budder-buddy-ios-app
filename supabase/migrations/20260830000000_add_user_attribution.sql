-- First-touch acquisition data (landing page, referrer, UTM params) for the
-- Command Center CRM's "Acquisition" panel. Web-only in practice — the
-- native app has no query string / document.referrer to capture, so rows
-- only ever land for signups that started at budderbuddy.org. See
-- src/lib/firstTouch.ts + src/hooks/useAttributionCapture.ts for the capture
-- flow (stashed in localStorage pre-auth, flushed here once a user_id exists).
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

ALTER TABLE public.user_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record their own first-touch attribution"
  ON public.user_attribution FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages attribution"
  ON public.user_attribution FOR ALL
  USING (auth.role() = 'service_role');
