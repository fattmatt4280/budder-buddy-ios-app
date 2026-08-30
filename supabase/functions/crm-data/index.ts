import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Internal-only data feed for the DreamOps Command Center CRM tab. Runs
// server-side with the service role key, gated by its own shared secret
// (CRM_API_SECRET) — not a Supabase JWT. Ported from Fridge-Spy's
// src/routes/api/public/crm-data.ts, adapted to this app's actual data: no
// dedicated activity_log/onboarding-timestamp tables exist, so every real
// signal below is read straight from the tables the app already writes
// (user_tattoos, user_checkins, photos, user_settings, user_attribution) —
// see the file each field is commented with. Nothing here is faked; a gap
// (e.g. acquisition for a native-app signup) reports null, not a guess.
//
// GET  /crm-data?resource=customers    -> auth.users + profiles + settings + tattoos/checkins/photos + subscriptions
// GET  /crm-data?resource=waitlist     -> [] — Budder Buddy has no waitlist/coming-soon capture
// GET  /crm-data?resource=subscriptions -> public.subscriptions joined with email
// GET  /crm-data?resource=timeline&user_id=<uuid> -> one user's tattoos/checkins/photos, merged and sorted
// GET  /crm-data?resource=funnel       -> signup -> first tattoo -> first checkin -> first photo -> converted
//
// POST /crm-data { action: "set-premium", user_id, premium: bool }
//   -> there's no profiles.premium_user flag here (premium is derived from
//      subscriptions.status). Grant = upsert an active, far-future manual
//      comp row. Revoke = mark the existing row canceled/expired now.
// POST /crm-data { action: "delete-user", user_id }
//   -> permanently deletes the auth user. subscriptions.user_id has no FK
//      cascade (checked in the migration that created it), so every
//      per-user table is deleted explicitly first, same list as
//      supabase/functions/delete-account/index.ts. Irreversible.

type AnyRow = Record<string, any>;

const allowedOrigins = [
  'https://f8e96625-555b-4f76-9c47-7869ccd21511.lovableproject.com',
  'https://id-preview--f8e96625-555b-4f76-9c47-7869ccd21511.lovable.app',
  'https://budderbuddy.org',
  'https://www.budderbuddy.org',
  'capacitor://localhost',
  'http://localhost',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.some(a => origin === a || origin.endsWith('.lovable.app'))
    ? origin
    : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

// Manual comp rows use this as their product_id so they're visually
// distinguishable from a real Apple purchase in the billing tab.
const MANUAL_COMP_PRODUCT_ID = 'manual_comp';
const PREMIUM_STATUSES = new Set(['active', 'grace_period']);

async function listAllUsers(admin: ReturnType<typeof createClient>) {
  const perPage = 1000;
  let page = 1;
  const all: AnyRow[] = [];
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    all.push(...(data?.users ?? []));
    if (!data?.users || data.users.length < perPage) break;
    page += 1;
  }
  return all;
}

// Groups rows by user_id -> array (used for per-user aggregation below).
function groupByUser(rows: AnyRow[]): Map<string, AnyRow[]> {
  const m = new Map<string, AnyRow[]>();
  for (const r of rows) {
    if (!m.has(r.user_id)) m.set(r.user_id, []);
    m.get(r.user_id)!.push(r);
  }
  return m;
}

function earliest(rows: AnyRow[]): string | null {
  return rows.reduce<string | null>((min, r) => (!min || r.created_at < min ? r.created_at : min), null);
}

// null = "too early to tell" (account isn't old enough yet), not "false".
function retention(signedUpAt: string, lastActiveAt: string | null) {
  const signup = new Date(signedUpAt).getTime();
  const ageDays = (Date.now() - signup) / 86400000;
  const activeDays = lastActiveAt ? (new Date(lastActiveAt).getTime() - signup) / 86400000 : 0;
  const flag = (n: number) => (ageDays < n ? null : activeDays >= n);
  return { d1: flag(1), d7: flag(7), d30: flag(30) };
}

// Transparent status-based heuristic — no list-price data exists here (Apple
// IAP prices come from StoreKit at purchase time, never stored), so unlike
// Fridge-Spy's version this can't factor in CLV.
function churnRisk(sub: AnyRow | undefined): { level: 'low' | 'medium' | 'high'; reason: string } {
  if (!sub || sub.status === 'free') return { level: 'low', reason: 'Never subscribed' };
  if (sub.status === 'grace_period') return { level: 'high', reason: 'Apple billing retry (grace period)' };
  if (sub.status === 'canceled') return { level: 'medium', reason: `Canceled, access until ${sub.expires_at ?? 'unknown'}` };
  if (sub.status === 'expired') return { level: 'low', reason: 'Already lapsed' };
  return { level: 'low', reason: 'Active subscription' };
}

// Fetches the tables every resource below aggregates from, in parallel.
async function fetchEngagementTables(admin: ReturnType<typeof createClient>) {
  const [profilesRes, settingsRes, tattoosRes, checkinsRes, photosRes, subsRes, attrRes] = await Promise.all([
    admin.from('profiles').select('user_id,display_name'),
    admin.from('user_settings').select('user_id,settings'),
    admin.from('user_tattoos').select('user_id,created_at'),
    admin.from('user_checkins').select('user_id,created_at'),
    admin.from('photos').select('user_id,created_at'),
    admin.from('subscriptions').select('user_id,status,product_id,expires_at,original_purchase_date,created_at'),
    admin.from('user_attribution').select('user_id,landing_page,referrer,utm_source,utm_medium,utm_campaign,utm_term,utm_content'),
  ]);
  for (const r of [profilesRes, settingsRes, tattoosRes, checkinsRes, photosRes, subsRes, attrRes]) {
    if (r.error) throw r.error;
  }
  return {
    pMap: new Map((profilesRes.data ?? []).map((p: AnyRow) => [p.user_id, p])),
    settingsMap: new Map((settingsRes.data ?? []).map((s: AnyRow) => [s.user_id, s.settings || {}])),
    tattoosByUser: groupByUser(tattoosRes.data ?? []),
    checkinsByUser: groupByUser(checkinsRes.data ?? []),
    photosByUser: groupByUser(photosRes.data ?? []),
    subMap: new Map((subsRes.data ?? []).map((s: AnyRow) => [s.user_id, s])), // 1 row/user (unique constraint)
    attrMap: new Map((attrRes.data ?? []).map((a: AnyRow) => [a.user_id, a])),
    tattoosRaw: tattoosRes.data ?? [],
    checkinsRaw: checkinsRes.data ?? [],
    photosRaw: photosRes.data ?? [],
    subsRaw: subsRes.data ?? [],
  };
}

async function getCustomers(admin: ReturnType<typeof createClient>) {
  const [users, tables] = await Promise.all([listAllUsers(admin), fetchEngagementTables(admin)]);
  const { pMap, settingsMap, tattoosByUser, checkinsByUser, photosByUser, subMap, attrMap } = tables;

  const rows = users.map((u: AnyRow) => {
    const p: AnyRow = pMap.get(u.id) || {};
    const sub = subMap.get(u.id);
    const attr = attrMap.get(u.id);
    const tattoos = tattoosByUser.get(u.id) || [];
    const checkins = checkinsByUser.get(u.id) || [];
    const photos = photosByUser.get(u.id) || [];

    const events = [...tattoos, ...checkins, ...photos];
    const lastEventAt = events.length ? events.map(e => e.created_at).sort().pop()! : null;
    const lastActiveAt = [u.last_sign_in_at, lastEventAt].filter(Boolean).sort().pop() ?? null;

    return {
      id: u.id,
      email: u.email,
      display_name: p.display_name ?? null,
      premium_user: sub ? PREMIUM_STATUSES.has(sub.status) : false,
      signed_up_at: u.created_at,
      last_active_at: lastActiveAt,

      // Real, but web-signups-only — see supabase/migrations/*_add_user_attribution.sql.
      // null means never captured (native-app signup, or pre-instrumentation), not "organic".
      acquisition: attr
        ? {
            landing_page: attr.landing_page,
            referrer: attr.referrer,
            utm_source: attr.utm_source,
            utm_medium: attr.utm_medium,
            utm_campaign: attr.utm_campaign,
            utm_term: attr.utm_term,
            utm_content: attr.utm_content,
          }
        : null,

      // No separate "onboarding started/completed" moment exists — the app's
      // own WelcomeScreen unlock logic treats "has a tattoo" as the signal
      // that onboarding is done, so first_tattoo_added_at IS that milestone.
      onboarding_started_at: null,
      onboarding_completed_at: null,

      first_tattoo_added_at: earliest(tattoos),
      first_checkin_at: earliest(checkins),
      first_photo_at: earliest(photos),

      total_activity_events: events.length,
      feature_usage: {
        tattoo_added: tattoos.length,
        checkin: checkins.length,
        photo_uploaded: photos.length,
      },

      retained: retention(u.created_at, lastActiveAt),

      subscription_status: sub?.status ?? 'free',
      converted_at: sub?.original_purchase_date ?? (sub && sub.status !== 'free' ? sub.created_at : null),
      clv_estimate: null, // no stored price data to estimate from (see churnRisk comment)
      churn_risk: churnRisk(sub),
    };
  });
  rows.sort((a, b) => new Date(b.signed_up_at).getTime() - new Date(a.signed_up_at).getTime());
  return rows;
}

async function getSubscriptions(admin: ReturnType<typeof createClient>) {
  const [subsRes, users] = await Promise.all([
    admin
      .from('subscriptions')
      .select('id,user_id,status,product_id,expires_at,original_purchase_date,created_at')
      .order('created_at', { ascending: false }),
    listAllUsers(admin),
  ]);
  if (subsRes.error) throw subsRes.error;
  const uMap = new Map(users.map((u: AnyRow) => [u.id, u.email]));
  return (subsRes.data ?? []).map((s: AnyRow) => ({
    ...s,
    customer_email: uMap.get(s.user_id) ?? null,
    current_period_start: s.original_purchase_date,
    current_period_end: s.expires_at,
    environment: s.product_id === MANUAL_COMP_PRODUCT_ID ? 'manual' : null,
  }));
}

// No activity_log table — the timeline is synthesized by merging the three
// tables a user actually writes to, newest first.
async function getTimeline(admin: ReturnType<typeof createClient>, userId: string | null) {
  if (!userId) throw new Error('timeline requires ?user_id=<uuid>');
  const [tattoosRes, checkinsRes, photosRes] = await Promise.all([
    admin.from('user_tattoos').select('id,body_location,created_at').eq('user_id', userId),
    admin.from('user_checkins').select('id,day_number,created_at').eq('user_id', userId),
    admin.from('photos').select('id,day_number,created_at').eq('user_id', userId),
  ]);
  for (const r of [tattoosRes, checkinsRes, photosRes]) if (r.error) throw r.error;

  const rows: AnyRow[] = [
    ...(tattoosRes.data ?? []).map((t: AnyRow) => ({
      id: t.id,
      kind: 'tattoo_added',
      message: t.body_location || null,
      created_at: t.created_at,
    })),
    ...(checkinsRes.data ?? []).map((c: AnyRow) => ({
      id: c.id,
      kind: 'checkin',
      message: `Day ${c.day_number}`,
      created_at: c.created_at,
    })),
    ...(photosRes.data ?? []).map((p: AnyRow) => ({
      id: p.id,
      kind: 'photo_uploaded',
      message: `Day ${p.day_number}`,
      created_at: p.created_at,
    })),
  ];
  rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return rows.slice(0, 200);
}

// Signup -> first tattoo -> first checkin -> first photo -> conversion,
// as distinct-user counts per step.
async function getFunnel(admin: ReturnType<typeof createClient>) {
  const [users, tables] = await Promise.all([listAllUsers(admin), fetchEngagementTables(admin)]);
  const { subMap } = tables;
  const distinct = (rows: AnyRow[]) => new Set(rows.map(r => r.user_id)).size;

  const totalSignups = users.length;
  const firstTattoo = distinct(tables.tattoosRaw);
  const firstCheckin = distinct(tables.checkinsRaw);
  const firstPhoto = distinct(tables.photosRaw);
  const everConverted = distinct(tables.subsRaw);
  const currentlyPremium = users.filter((u: AnyRow) => PREMIUM_STATUSES.has(subMap.get(u.id)?.status)).length;

  const steps = [
    { step: 'signed_up', label: 'Signed Up', count: totalSignups },
    { step: 'first_tattoo_added', label: 'First Tattoo Added', count: firstTattoo },
    { step: 'first_checkin', label: 'First Check-in', count: firstCheckin },
    { step: 'first_photo', label: 'First Photo Uploaded', count: firstPhoto },
    { step: 'converted', label: 'Converted to Paid (ever)', count: everConverted },
  ];
  return {
    steps: steps.map((s, i) => ({
      ...s,
      pct_of_signups: totalSignups ? Math.round((s.count / totalSignups) * 1000) / 10 : 0,
      drop_off_from_prev: i === 0 ? null : steps[i - 1].count - s.count,
    })),
    currently_premium: currentlyPremium,
  };
}

async function setPremium(admin: ReturnType<typeof createClient>, userId: string, premium: boolean) {
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 100);

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      status: premium ? 'active' : 'canceled',
      product_id: premium ? MANUAL_COMP_PRODUCT_ID : undefined,
      expires_at: premium ? farFuture.toISOString() : new Date().toISOString(),
      original_purchase_date: premium ? new Date().toISOString() : undefined,
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
  return { ok: true };
}

// Same per-user table list as supabase/functions/delete-account/index.ts
// (plus user_attribution, added for CRM acquisition tracking), run with the
// admin client instead of requiring the target user's own JWT — this is an
// operator action from the CRM, not self-service.
async function deleteUser(admin: ReturnType<typeof createClient>, userId: string) {
  const { data: files } = await admin.storage.from('tattoo-photos').list(userId);
  if (files?.length) {
    for (const folder of files) {
      if (!folder.id) continue;
      const { data: subFiles } = await admin.storage.from('tattoo-photos').list(`${userId}/${folder.name}`);
      if (subFiles?.length) {
        await admin.storage.from('tattoo-photos').remove(subFiles.map(f => `${userId}/${folder.name}/${f.name}`));
      }
    }
  }

  for (const table of ['photos', 'user_checkins', 'user_tattoos', 'user_settings', 'subscriptions', 'tattoo_wishlist', 'user_attribution', 'user_roles', 'profiles']) {
    const { error } = await admin.from(table).delete().eq('user_id', userId);
    if (error) console.error(`Error deleting ${table}:`, error);
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
  return { ok: true };
}

function checkAuth(req: Request): boolean {
  const secret = Deno.env.get('CRM_API_SECRET');
  const auth = req.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  return !!secret && token === secret;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  if (!checkAuth(req)) return json({ error: 'Unauthorized' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    if (req.method === 'GET') {
      const resource = new URL(req.url).searchParams.get('resource');
      if (resource === 'customers') return json(await getCustomers(admin));
      if (resource === 'waitlist') return json([]); // no waitlist/coming-soon capture exists for this app
      if (resource === 'subscriptions') return json(await getSubscriptions(admin));
      if (resource === 'timeline') return json(await getTimeline(admin, new URL(req.url).searchParams.get('user_id')));
      if (resource === 'funnel') return json(await getFunnel(admin));
      return json({ error: 'Unknown resource. Use ?resource=customers | waitlist | subscriptions | timeline | funnel' }, 400);
    }

    if (req.method === 'POST') {
      let body: AnyRow;
      try {
        body = await req.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }
      const { action, user_id } = body;
      if (!user_id) return json({ error: 'user_id required' }, 400);

      if (action === 'set-premium') {
        if (typeof body.premium !== 'boolean') return json({ error: 'premium (bool) required' }, 400);
        return json(await setPremium(admin, user_id, body.premium));
      }
      if (action === 'delete-user') return json(await deleteUser(admin, user_id));
      return json({ error: 'Unknown action. Use set-premium | delete-user' }, 400);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (e) {
    console.error('crm-data error:', e);
    return json({ error: String(e) }, 500);
  }
});
