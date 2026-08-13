-- Adds a self-reported "concerned" flag to daily check-ins. Surfaced in the
-- app from day 2 onward as "I'm a little concerned..." — when checked, it
-- triggers the same Heal Aid (heal-aid.com) redirect prompt used for
-- symptom-based detection.
ALTER TABLE public.user_checkins
  ADD COLUMN concerned BOOLEAN NOT NULL DEFAULT false;
