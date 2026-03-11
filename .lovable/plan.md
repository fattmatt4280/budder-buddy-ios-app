

## Replace RevenueCat API Key

Update the hardcoded test key in `src/lib/purchaseService.ts` with the production key `appl_mUpIDLyrAYMnNGtAUPRdCUZMwgE`.

Single line change — line 7 of `purchaseService.ts`:
```
const REVENUECAT_API_KEY = 'appl_mUpIDLyrAYMnNGtAUPRdCUZMwgE';
```

This is a publishable client-side key, safe to store in the codebase.

