

# Fix RevenueCat Configuration to Match Your Setup

## Problem
Three mismatches between your RevenueCat/App Store Connect setup and the current code:

1. **Entitlement ID case mismatch** -- Code uses `'pro'` but RevenueCat has `'Pro'` (capital P). This would prevent the app from recognizing active subscriptions.
2. **Fallback prices are wrong** -- Code shows $2.99/mo and $24.99/yr, but your actual prices are $3.99/mo and $24.99/yr.

## Changes

### 1. Fix entitlement ID (`src/lib/purchaseService.ts`)
Change `ENTITLEMENT_ID` from `'pro'` to `'Pro'` on line 9.

### 2. Fix entitlement ID in server validation (`supabase/functions/validate-receipt/index.ts`)
The edge function also checks for `subscriber.entitlements.pro` -- needs to be `subscriber.entitlements.Pro`.

### 3. Update fallback prices (`src/lib/purchaseService.ts`)
Change the monthly fallback from `$2.99/mo` to `$3.99/mo` in the `fallbackMonthly()` method. (On native iOS, real prices are fetched from RevenueCat automatically -- these fallbacks only show in the web preview.)

### 4. Update paywall default price display (`src/pages/PaywallScreen.tsx`)
The fallback price string `$2.99/mo` updates to `$3.99/mo`.

## Technical Details
- The `ENTITLEMENT_ID` constant is used in `purchase()`, `restore()`, and `checkEntitlement()` to verify if the user has active Pro access
- The `validate-receipt` edge function reads `subscriber.entitlements.Pro` from the RevenueCat REST API response
- No database changes needed -- the subscriptions table structure is already correct

