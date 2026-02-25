

# Apple In-App Purchase Subscription ($2.99/mo)

You're 100% right -- for an iOS app, Apple handles all the billing. Users tap "Subscribe," Face ID confirms, Apple charges their card on file. No Stripe needed. Apple takes a 15% cut (under the Small Business Program for revenue under $1M/year), and you get paid monthly through App Store Connect.

## How It Works

1. User taps "Go Pro" in the app
2. Apple's native payment sheet appears (Face ID / Touch ID)
3. Apple charges their card on file -- $2.99/month
4. Apple sends a receipt back to the app
5. The app validates the receipt with your backend
6. Premium features unlock instantly
7. Apple auto-renews monthly -- user can cancel anytime via Settings on their phone

## What We Build

### 1. Apple App Store Connect Setup (You Do This)
Before we write any code, you'll need to create the subscription product in App Store Connect:
- Go to App Store Connect > Your App > Monetization > Subscriptions
- Create a Subscription Group (e.g., "Budder Buddy Pro")
- Add a product: `budderbuddy_pro_monthly` at $2.99/month
- This gives you the Product ID we'll reference in code

### 2. Native StoreKit Plugin (Capacitor)
Install `@capawesome-team/capacitor-purchases` or `capacitor-purchases` (RevenueCat wrapper) to handle StoreKit 2 communication. This gives us:
- Fetch available products (price, description)
- Trigger the native Apple purchase sheet
- Listen for purchase completion
- Restore previous purchases (required by Apple)

### 3. Backend Receipt Validation
Create a backend function `validate-receipt` that:
- Receives the Apple receipt/transaction from the app
- Validates it with Apple's server (App Store Server API)
- Stores subscription status in a `subscriptions` table
- Returns the verified premium status

### 4. Database: Subscriptions Table

| Column | Purpose |
|--------|---------|
| user_id | The subscriber |
| apple_transaction_id | Apple's transaction reference |
| product_id | "budderbuddy_pro_monthly" |
| status | active, expired, canceled |
| expires_at | When the current period ends |
| original_purchase_date | First subscription date |

Protected by RLS -- users can only see their own subscription.

### 5. Premium Status Hook
A `usePremiumStatus()` hook that:
- Checks the `subscriptions` table for active status
- Falls back to checking StoreKit locally (for offline use)
- Exposes `isPro`, `isLoading`, `purchase()`, `restore()`

### 6. Premium Gate Component
A reusable `<PremiumGate>` component that wraps premium features:
- If Pro: shows the feature normally
- If Free: shows a friendly upgrade card with "Go Pro - $2.99/mo" button
- Tapping the button triggers the native Apple payment sheet

### 7. Feature Gating
**Free tier** (hooks them in):
- 1 active healing tattoo
- Basic reminders and daily tips
- Learn section articles
- Basic Ink Vault

**Pro tier** ($2.99/mo):
- Unlimited tattoo tracking
- Ghost Camera
- AI Healing Guide chat
- Timelapse export
- Tattoo anniversaries and milestone reminders
- Long-term care reminders
- Next tattoo wishlist/planning

### 8. Settings Screen Updates
Add a "Your Plan" section to Settings:
- Shows current plan (Free / Pro)
- If Pro: shows renewal date, note to manage in Apple Settings
- If Free: shows upgrade CTA
- "Restore Purchases" button (Apple requires this)

### 9. Retention Features (Pro-only, built alongside)
- **Tattoo Anniversaries**: Milestone notifications at 1mo, 6mo, 1yr with photo comparison prompts
- **Long-term Care Reminders**: Ongoing sun protection and moisturize reminders post-healing
- **Next Tattoo Wishlist**: Planning section in Ink Vault for future tattoo ideas

---

## Technical Details

### Files to Create
- `src/hooks/usePremiumStatus.ts` -- subscription state management
- `src/components/premium/PremiumGate.tsx` -- feature gate wrapper
- `src/components/premium/UpgradeCard.tsx` -- upgrade prompt UI
- `src/lib/purchaseService.ts` -- StoreKit/purchase logic abstraction
- `supabase/functions/validate-receipt/index.ts` -- Apple receipt validation

### Files to Modify
- `src/pages/GhostCameraScreen.tsx` -- wrap with PremiumGate
- `src/pages/HealingGuideScreen.tsx` -- gate AI chat tab
- `src/pages/InkVaultScreen.tsx` -- gate adding 2nd+ tattoo
- `src/pages/SettingsScreen.tsx` -- add Plan section + Restore Purchases
- `src/contexts/AppDataContext.tsx` -- add premium status to context
- `src/types/index.ts` -- add subscription types
- `capacitor.config.ts` -- no changes needed
- `package.json` -- add StoreKit plugin dependency

### Apple Requirements We Must Follow
- "Restore Purchases" button must exist (Apple rejects apps without it)
- No external payment links (Apple policy for iOS)
- Subscription terms must be shown before purchase
- Cancel instructions must reference Apple Settings

### What You'll Need to Do Outside Lovable
1. Create the subscription product in App Store Connect
2. Set up your bank account in App Store Connect for payouts
3. Enroll in the Small Business Program (15% commission instead of 30%)
4. After we write the code: `git pull`, `npx cap sync ios`, rebuild in Xcode

