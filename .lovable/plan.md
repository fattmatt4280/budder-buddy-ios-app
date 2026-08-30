# Plan: crm-data edge function + user attribution

Internal data feed for the DreamOps Command Center CRM. Not user-facing.

## Steps

1. **Migration** (via the database migration tool, using the exact SQL provided):
   - Create `public.user_attribution` table (one row per user: landing page, referrer, UTM params, captured timestamp)
   - RLS: users can only insert their own row; service role has full access
   - Add GRANT statements (insert for authenticated, all for service_role) — required for the Data API to reach the table

2. **Edge function** `supabase/functions/crm-data/index.ts`:
   - Create the file empty first; you paste the exact content next message
   - Add `[functions.crm-data] verify_jwt = false` block to `supabase/config.toml`

3. **Acquisition capture (frontend)**:
   - Create `src/lib/firstTouch.ts` and `src/hooks/useAttributionCapture.ts` empty; you paste the exact content
   - `src/main.tsx`: import and call `captureFirstTouch()` near the top, before `initializeSecureAuth()`
   - `src/App.tsx`: in `AppRoutes`, call `useAttributionCapture(userId)` with `userId` from `useAppData()`

4. **Secret**: `CRM_API_SECRET` added via the secure secret field (you provide the value separately)

## Technical details
- No logic changes — straight port of an already-tested implementation
- Migration runs only after your approval; edge function code deploys automatically once written
