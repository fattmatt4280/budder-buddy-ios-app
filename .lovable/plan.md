

# Add Paywall Screen with Monthly and Yearly Subscription Options

## Overview
Currently the app only offers a single "$2.99/mo" monthly option with no plan selection. This plan adds a dedicated, polished paywall screen that lets users choose between monthly and yearly subscriptions before purchasing.

## What Changes

### 1. New Paywall Screen (`src/pages/PaywallScreen.tsx`)
A full-screen upgrade page accessible from Settings, PremiumGate, and UpgradeCard. It will include:
- App mascot/branding at the top
- Feature list (Ghost Camera, AI Healing Guide, Timelapse, Unlimited Tattoos)
- Toggle between Monthly ($2.99/mo) and Yearly ($24.99/yr -- save 30%) plan cards
- Selected plan highlighted with a border/glow
- "Continue" purchase button showing the selected price
- "Restore Purchases" link at the bottom
- Privacy/terms links and Apple auto-renewal disclaimer text
- Route added at `/upgrade`

### 2. Update Purchase Service (`src/lib/purchaseService.ts`)
- Add a `purchaseMonthly()` and `purchaseAnnual()` method (or a single `purchase(plan: 'monthly' | 'annual')` with plan parameter)
- Fetch both `monthly` and `annual` packages from RevenueCat offerings
- Add `getProducts()` method returning both plan prices (so the paywall can show real App Store prices on native, fallback prices on web)

### 3. Update Premium Hook (`src/hooks/usePremiumStatus.ts`)
- Update the `purchase` function to accept an optional plan parameter (`'monthly' | 'annual'`), defaulting to `'monthly'`

### 4. Update AppDataContext (`src/contexts/AppDataContext.tsx`)
- Update the `purchase` type signature to accept the plan parameter

### 5. Update Existing Upgrade Touchpoints
- **UpgradeCard**: Change the "Go Pro" button to navigate to `/upgrade` instead of calling `purchase()` directly
- **PremiumGate**: Same -- redirect to `/upgrade`
- **PhotoUpgradeModal**: Same -- redirect to `/upgrade`
- **Settings "YOUR PLAN" section**: Change "Go Pro" button to navigate to `/upgrade`

### 6. Add Route (`src/App.tsx`)
- Add `/upgrade` route pointing to `PaywallScreen`

## Pricing Display
- Monthly: $2.99/mo (fallback; real price fetched from RevenueCat on native)
- Yearly: $24.99/yr with "Save 30%" badge (fallback; real price from RevenueCat)

## Technical Notes
- RevenueCat offerings must have both `monthly` and `annual` packages configured in the dashboard
- The `validate-receipt` edge function needs no changes -- it already checks the `pro` entitlement regardless of billing period
- Yearly product ID must be configured in RevenueCat (e.g., `20260224_annual`)
- On web preview, both buttons will show fallback prices since RevenueCat SDK is native-only

