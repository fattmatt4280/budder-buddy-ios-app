

# Budder Buddy -- Pre-Launch Security Audit Report

---

## SECURITY SCORE: 62 / 100

## App Store Readiness: NOT READY (Conditional -- 4 blockers, see below)

---

## PASS 1 -- STATIC AND ARCHITECTURAL ANALYSIS

### 1.1 Exposed API Keys and Secrets

| ID | Severity | Finding |
|----|----------|---------|
| S-01 | **LOW** | Supabase anon key exposed in `.env` and client bundle. This is by design (public key), but combined with misconfigured RLS or edge functions could escalate. **No action needed** -- anon key is intended to be public. |
| S-02 | **MEDIUM** | `healing-guide` edge function uses `CORS: Access-Control-Allow-Origin: *` (wildcard). Any origin can call this endpoint. An attacker can abuse the AI endpoint from any website, consuming your AI quota. |
| S-03 | **LOW** | `LOVABLE_API_KEY` is stored as a server-side secret (not exposed to client). Correct. |

### 1.2 Authentication Flow

| ID | Severity | Finding |
|----|----------|---------|
| A-01 | **LOW** | Auth uses Supabase email/password with JWT. Sessions persist via `onAuthStateChange` + `getSession()`. Listener registered before session check -- correct pattern to prevent race conditions. |
| A-02 | **MEDIUM** | `useAuth.ts` calls `getSession()` which reads from local storage. On web, this is fine. On native, `secureStorageAdapter` exists but **the Supabase client in `client.ts` still uses `storage: localStorage`** -- it does NOT use the `secureStorageAdapter`. The adapter exists but is never wired into the Supabase client. Auth tokens are stored in plaintext localStorage on iOS, NOT in the Keychain as documented. |
| A-03 | **LOW** | Password minimum is 6 characters (Zod validation). Supabase default is also 6. Acceptable for consumer apps but below NIST recommendation of 8+. |

**Exploit Scenario (A-02):** On a jailbroken iOS device, an attacker can read `Library/WebKit/.../LocalStorage` and extract the JWT refresh token, gaining persistent access to the victim's account.

**Remediation (A-02):** Wire `secureStorageAdapter` into the Supabase client constructor:
```typescript
// client.ts
import { secureStorageAdapter } from '@/lib/secureStorageAdapter';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: secureStorageAdapter, // USE THIS instead of localStorage
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### 1.3 Role-Based Access Control (RBAC)

| ID | Severity | Finding |
|----|----------|---------|
| R-01 | **HIGH** | `subscriptions` table has an **INSERT** RLS policy allowing `auth.uid() = user_id`. Any authenticated user can insert a row into `subscriptions` with `status: 'active'` and grant themselves Pro access. There is no server-side validation preventing this. |
| R-02 | **MEDIUM** | `user_roles` table: Users can view their own roles (SELECT). Admin management policy uses `has_role()` which is `SECURITY DEFINER` -- correct. However, the `auto_assign_admin` trigger hardcodes email addresses. If an attacker registers `matt@dreamtattoocompany.com` before the real owner, they get admin. Email verification is required, so this requires access to that mailbox -- mitigated but worth noting. |
| R-03 | **MEDIUM** | `tattoo_wishlist` RLS policies are marked `Permissive: No` (restrictive). This is unusual and may cause access issues if there are no permissive policies to combine with. Verify these work correctly. |

**Exploit Scenario (R-01):** Any authenticated user can run:
```javascript
await supabase.from('subscriptions').insert({
  user_id: '<my-user-id>',
  status: 'active',
  product_id: '20260224',
  expires_at: '2099-01-01T00:00:00Z'
});
```
This grants permanent Pro access without paying.

**Remediation (R-01) -- CRITICAL:**
Remove the INSERT policy from `subscriptions` for regular users. Only the `validate-receipt` edge function (using service role) should write to this table:
```sql
-- Remove the user INSERT policy
DROP POLICY "Users can insert own subscription" ON subscriptions;
```

### 1.4 Insecure Direct Object Reference (IDOR)

| ID | Severity | Finding |
|----|----------|---------|
| I-01 | **LOW** | All tables use `auth.uid() = user_id` in RLS. This prevents cross-user data access at the database level. No IDOR risk via standard queries. |
| I-02 | **LOW** | Photo storage paths use `{userId}/{tattooId}/{timestamp}.jpg` -- namespaced by user ID. Storage bucket is private with RLS. Correct. |

### 1.5 Third-Party SDK Review

| ID | Severity | Finding |
|----|----------|---------|
| T-01 | **LOW** | `@huggingface/transformers` (v3.8.1) is listed as a dependency but appears unused in any source file. Dead dependency increases attack surface. Remove it. |
| T-02 | **LOW** | `gifshot` is used for client-side GIF generation only. No data exfiltration risk. |
| T-03 | **LOW** | No analytics SDKs, no tracking pixels, no ad frameworks. Analytics is console-only. Clean. |

### 1.6 Sensitive Data in Local Storage

| ID | Severity | Finding |
|----|----------|---------|
| L-01 | **MEDIUM** | `budder_tattoos`, `budder_checkins`, `budder_settings` are stored in plaintext localStorage. Contains tattoo dates, body locations, health observations (symptom tags like "Sore", "Hot to touch", "Itchy"), and journal notes. This is health-adjacent PII stored unencrypted on-device. |
| L-02 | **MEDIUM** | As noted in A-02, auth tokens are in localStorage, not Keychain. |

---

## PASS 2 -- DATA FLOW AND PRIVACY AUDIT

### 2.1 PII Inventory

| Data Type | Collection Point | Storage | Encrypted at Rest | Encrypted in Transit |
|-----------|-----------------|---------|-------------------|---------------------|
| Email | AuthScreen | Supabase Auth | Yes (Supabase managed) | Yes (TLS) |
| Password | AuthScreen | Supabase Auth (bcrypt) | Yes | Yes (TLS) |
| Display Name | AuthScreen | profiles table | Yes (Supabase managed) | Yes (TLS) |
| Tattoo body location | AddTattooDialog | user_tattoos + localStorage | DB: Yes / Local: **No** | Yes (TLS) |
| Health observations | DailyCheckinScreen | user_checkins + localStorage | DB: Yes / Local: **No** | Yes (TLS) |
| Journal notes | DailyCheckinScreen | user_checkins + localStorage | DB: Yes / Local: **No** | Yes (TLS) |
| GPS coordinates | environmentService | Not stored (transient) | N/A | Yes (TLS to Open-Meteo) |
| Tattoo photos | PhotosScreen | Supabase Storage (tattoo-photos) | Yes (Supabase managed) | Yes (TLS) |

### 2.2 Data Deletion

| ID | Severity | Finding |
|----|----------|---------|
| D-01 | **MEDIUM** | `delete-account` edge function deletes from `photos`, `profiles`, and auth -- but does NOT delete from `user_tattoos`, `user_checkins`, `user_settings`, `subscriptions`, `tattoo_wishlist`, or `user_roles`. **Orphaned PII remains in the database after account deletion.** This is a GDPR/CCPA violation. |
| D-02 | **LOW** | Client-side `localStorage.clear()` is called on account deletion. Correct for local cleanup. |

**Remediation (D-01) -- CRITICAL for GDPR:**
Update `delete-account` to delete from ALL user tables before deleting the auth user:
```typescript
// Add these deletions before step 4 (delete auth user):
await supabaseAdmin.from('user_checkins').delete().eq('user_id', userId);
await supabaseAdmin.from('user_tattoos').delete().eq('user_id', userId);
await supabaseAdmin.from('user_settings').delete().eq('user_id', userId);
await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);
await supabaseAdmin.from('tattoo_wishlist').delete().eq('user_id', userId);
await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
```

### 2.3 Logging

| ID | Severity | Finding |
|----|----------|---------|
| LOG-01 | **LOW** | Production logger suppresses `log`, `warn`, `debug`. `error` always outputs. Error messages could contain user IDs or stack traces in device console. Acceptable for production debugging. |
| LOG-02 | **LOW** | Edge functions use raw `console.error` with error objects. These are server-side only (Deno runtime). Acceptable. |
| LOG-03 | **LOW** | `analyticsService.ts` logs events to `console.log` which is suppressed in production by the logger... except it uses `console.log` directly, NOT `logger.log`. Analytics events are visible in production device console. |

**Remediation (LOG-03):** Replace `console.log` in `analyticsService.ts` with `logger.log`.

### 2.4 GDPR/CCPA Compliance

| Requirement | Status |
|------------|--------|
| Right to access | Partial -- no export mechanism |
| Right to deletion | **INCOMPLETE** (D-01) |
| Data minimization | Good -- only collects what's needed |
| Consent | Disclaimer shown at onboarding |
| Privacy policy | Present at /privacy |
| App Tracking Transparency | Not needed -- no tracking SDKs |

---

## PASS 3 -- ATTACK SIMULATION

### 3.1 MITM Attack
**Risk: LOW.** All API calls use HTTPS (Supabase URLs). Capacitor config enforces ATS. Open-Meteo API call is also HTTPS. No cleartext HTTP endpoints.

### 3.2 API Abuse via Direct Requests

| ID | Severity | Finding |
|----|----------|---------|
| API-01 | **CRITICAL** | `validate-receipt` edge function has `verify_jwt = false` in config.toml AND uses `CORS: *`. The function does verify JWT in-code, which is correct. However, it does NOT actually validate receipts with Apple. Comment on line 49: "For now, we trust the client-side transaction." **Any authenticated user can send a fake transactionId and get a Pro subscription.** |
| API-02 | **HIGH** | Combined with R-01 (INSERT on subscriptions), there are TWO paths to free Pro access. |
| API-03 | **MEDIUM** | `healing-guide` has no rate limiting beyond what the AI gateway provides (429 handling). An attacker could spam the endpoint to exhaust AI credits. |
| API-04 | **MEDIUM** | `healing-guide` has `verify_jwt = false` is not set in config.toml (it's not listed), and uses anon key auth (`Authorization: Bearer anon_key`). This means unauthenticated users can call the AI endpoint. The anon key is public. |

**Remediation (API-01) -- CRITICAL BLOCKER:**
Before App Store launch, implement Apple App Store Server API validation in `validate-receipt`:
```typescript
// Call Apple's /inApps/v1/transactions/{transactionId} endpoint
// Verify the signed transaction (JWS) with Apple's certificate
// Only activate subscription if Apple confirms it's valid
```

**Remediation (API-04):**
Add `healing-guide` to config.toml with JWT verification, or add authentication check in the function:
```toml
[functions.healing-guide]
verify_jwt = false  # But validate JWT in-code like delete-account does
```

### 3.3 Rate Limit Bypass
**Risk: MEDIUM.** No client-side or server-side rate limiting on:
- Login attempts (brute force possible)
- AI chat messages
- Photo uploads
- Check-in submissions

Supabase Auth has built-in rate limiting for auth endpoints (configurable). The AI gateway returns 429 on overload. No custom rate limiting exists.

### 3.4 SQL/NoSQL Injection
**Risk: LOW.** All database queries use the Supabase SDK with parameterized queries. No raw SQL from user input. React renders text content safely (no `dangerouslySetInnerHTML`). The only dynamic string interpolation in queries is for user IDs and enum values from controlled inputs (Select components with fixed options).

### 3.5 XSS Injection
**Risk: LOW.** React auto-escapes JSX. No `dangerouslySetInnerHTML` found. User-generated content (notes, journal entries) is rendered via `{text}` interpolation which is safe. AI chat responses are rendered with `whitespace-pre-wrap` in a `<p>` tag -- safe.

### 3.6 CSRF
**Risk: LOW.** API calls use JWT Bearer tokens in Authorization headers, not cookies. CSRF is not applicable to Bearer token auth.

### 3.7 Replay Attack
**Risk: MEDIUM.** JWTs have expiration and auto-refresh. However, the `validate-receipt` function accepts any `transactionId` string without Apple verification, making receipt replay trivial. See API-01.

### 3.8 Brute Force Login
**Risk: LOW-MEDIUM.** Supabase Auth has built-in rate limiting. No additional lockout mechanism on the client. No CAPTCHA. Acceptable for a consumer app at launch scale.

### 3.9 Enumeration Attack
**Risk: LOW.** Supabase Auth's default behavior returns generic errors for invalid credentials. The app shows "Invalid email or password" for failed logins. Sign-up does reveal if an email is "already registered" -- this is a minor enumeration vector but standard for consumer apps.

### 3.10 Deep Link Manipulation
**Risk: LOW.** The app uses standard React Router paths. No deep link handlers that pass parameters to sensitive operations. `ProtectedRoute` guards authenticated screens.

### 3.11 Tampered Client Requests
**Risk: HIGH.** As documented in R-01 and API-01, the client can directly write to `subscriptions` table and call `validate-receipt` with fake data.

### 3.12 Jailbroken/Rooted Device
**Risk: MEDIUM.** Auth tokens in localStorage (not Keychain) are trivially readable on jailbroken devices. Health data in localStorage is also exposed. See A-02 and L-01.

---

## OWASP Mobile Top 10 Assessment

| Category | Status | Notes |
|----------|--------|-------|
| M1: Improper Platform Usage | PARTIAL FAIL | Keychain adapter exists but not wired in |
| M2: Insecure Data Storage | FAIL | localStorage for auth tokens and health data |
| M3: Insecure Communication | PASS | All TLS, ATS enforced |
| M4: Insecure Authentication | PASS | JWT-based, auto-refresh, session persistence |
| M5: Insufficient Cryptography | PASS | Supabase handles encryption |
| M6: Insecure Authorization | FAIL | Users can self-grant Pro via INSERT on subscriptions |
| M7: Client Code Quality | PASS | Clean, typed, no obvious bugs |
| M8: Code Tampering | MEDIUM RISK | No jailbreak detection |
| M9: Reverse Engineering | LOW RISK | Standard React bundle, no sensitive logic client-side |
| M10: Extraneous Functionality | PARTIAL FAIL | Mock purchase flow in web preview, unused @huggingface/transformers dep |

---

## APP STORE REJECTION RISKS

| Risk | Likelihood | Reason |
|------|-----------|--------|
| **Guideline 3.1.1 -- In-App Purchase** | **HIGH** | `validate-receipt` does not validate with Apple. Mock purchase path exists. Apple will test this. |
| **Guideline 5.1.1 -- Data Collection** | MEDIUM | Incomplete account deletion (D-01) could trigger privacy review failure |
| **Guideline 2.1 -- App Completeness** | LOW | "TODO" comments in purchaseService for StoreKit integration |

---

## PRIORITIZED REMEDIATION ROADMAP

### Blockers (Must fix before App Store submission)

1. **[CRITICAL] R-01: Remove INSERT policy on subscriptions table.** Only the service-role edge function should write subscriptions. Direct client writes allow free Pro access.

2. **[CRITICAL] API-01: Implement Apple receipt validation in validate-receipt.** The function currently trusts any client-sent transaction ID. This must verify with Apple's App Store Server API before activating subscriptions.

3. **[CRITICAL] D-01: Complete account deletion.** Add deletion of `user_tattoos`, `user_checkins`, `user_settings`, `subscriptions`, `tattoo_wishlist`, and `user_roles` to the `delete-account` edge function.

4. **[HIGH] A-02: Wire secureStorageAdapter into Supabase client.** Change `storage: localStorage` to `storage: secureStorageAdapter` in `client.ts` (or a wrapper) so auth tokens use iOS Keychain.

### High Priority (Fix before or shortly after launch)

5. **[HIGH] S-02: Restrict CORS on healing-guide.** Replace wildcard CORS with the same origin-restricted pattern used in `delete-account`.

6. **[HIGH] API-04: Add authentication to healing-guide.** Require a valid JWT to prevent unauthenticated AI abuse.

7. **[MEDIUM] LOG-03: Replace console.log in analyticsService with logger.log.**

8. **[MEDIUM] T-01: Remove unused @huggingface/transformers dependency.**

### Low Priority (Post-launch)

9. **[LOW] R-03: Audit tattoo_wishlist restrictive policies.** Verify they work correctly -- restrictive policies without a permissive counterpart can silently block all access.

10. **[LOW] A-03: Consider increasing minimum password length to 8 characters.**

11. **[LOW] L-01: Consider encrypting local storage cache or limiting what health data is cached locally.**

