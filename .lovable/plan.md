

# Disable Paywall Until 5,000 Users

## Approach
Override `isPro` to always return `true` in the `usePremiumStatus` hook, bypassing all premium gates app-wide. This is the simplest single-line change -- when you're ready to re-enable, just remove it.

## Changes

### `src/hooks/usePremiumStatus.ts`
Add an early return at the top of the hook that forces `isPro: true` and skips all premium checks. A comment will mark it for easy removal later:

```typescript
// TODO: Remove this override when ready to enforce paywall (~5,000 users)
return {
  isPro: true,
  isLoading: false,
  status: 'override',
  expiresAt: null,
  purchase: async () => {},
  restore: async () => {},
  refresh: async () => {},
};
```

This means:
- All `PremiumGate` components will pass through
- The paywall screen still exists at `/upgrade` but users won't be directed there
- Ghost Camera, AI Healing Guide, Timelapse, and unlimited tattoos all unlocked
- No database or backend changes needed
- When you hit 5,000 users, just tell me and I'll remove the override

