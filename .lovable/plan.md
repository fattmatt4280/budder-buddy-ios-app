
# Welcome Screen to Sign Up Flow

## Summary
Two simple changes to make the first-time experience clearer for an iOS app:
1. Change "Get Started" button to "Sign Up" and navigate directly to the auth screen
2. After first sign up, users stay logged in automatically (this already works thanks to secure token storage)

---

## Changes Overview

| File | Changes |
|------|---------|
| `src/pages/onboarding/WelcomeScreen.tsx` | Change button text to "Sign Up" and navigate to `/auth` instead of `/learn` |

---

## How It Works

### First-Time User
1. User opens app for the first time
2. Sees Welcome screen with "Sign Up" button
3. Taps "Sign Up" - goes directly to auth screen
4. Creates account
5. Token saved to iOS Keychain (secure storage)
6. Welcome notification sent
7. Onboarding marked complete - user enters app

### Returning User
1. User opens app
2. Supabase automatically restores session from Keychain
3. `isAuthenticated` becomes `true`
4. Self-healing logic in App.tsx sets `hasCompletedOnboarding: true`
5. User goes straight to Today screen - no login needed

---

## Technical Details

### WelcomeScreen Changes

```typescript
const handleStart = () => {
  updateSettings({ hasAcknowledgedDisclaimer: true });
  navigate('/auth', { replace: true });  // Go to sign up
};

// Button text change
<Button>Sign Up</Button>
```

### Why Auto-Login Already Works

The app already has all the pieces in place:

1. **Secure Storage**: `secureStorageAdapter.ts` stores tokens in iOS Keychain
2. **Session Persistence**: Supabase client has `persistSession: true`
3. **Auto Refresh**: Supabase client has `autoRefreshToken: true`
4. **Self-Healing Logic**: App.tsx checks `isAuthenticated` and unlocks the app

When the app launches, `useAuth` calls `supabase.auth.getSession()` which retrieves the stored session from secure storage. If valid, user is automatically authenticated - no re-login needed!

---

## User Flow

```text
FIRST TIME:
Welcome Screen → "Sign Up" → Auth Screen → Create Account → Today Screen
                                                    ↓
                                          Token saved to Keychain

EVERY TIME AFTER:
App Launch → Session restored from Keychain → Today Screen
             (automatic, instant)
```
