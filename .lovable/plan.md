

# Fix Per-User Data Isolation

## Problem
When a new user signs in on the same device, they see the previous user's tattoos, check-ins, and settings because:
1. All hooks initialize state from a single shared localStorage key (e.g. `budder_tattoos`)
2. The sync logic sees "cloud empty, local has data" and imports the old user's data into the new account
3. `hasSynced` does not reset when the userId changes, so switching accounts can skip the cloud fetch entirely

## Solution
Clear localStorage caches when the user changes and reset sync state so cloud data is always fetched fresh for each account.

## Changes

### 1. `src/hooks/useCloudTattoos.ts`
- Reset `hasSynced` to `false` when `userId` changes (add a useEffect that watches userId)
- On sync, **clear local cache before fetching** so stale data from another user is never shown or imported
- Initialize state with empty array instead of localStorage (cloud is the source of truth for authenticated users)

### 2. `src/hooks/useCloudCheckins.ts`
- Same pattern: reset `hasSynced` on userId change
- Clear local cache before cloud sync
- Initialize with empty array

### 3. `src/hooks/useCloudSettings.ts`
- Same pattern: reset `hasSynced` on userId change
- Clear local cache before cloud sync
- Initialize with defaults instead of localStorage

### Technical Approach
In each hook, add a `useEffect` that watches `userId` and:
- Clears the corresponding localStorage key
- Resets state to empty/defaults
- Resets `hasSynced` to `false` so the cloud fetch runs again

This also prevents the dangerous "cloud empty + local has data = import" path from accidentally copying User A's data into User B's account.

## Files Modified
1. `src/hooks/useCloudTattoos.ts`
2. `src/hooks/useCloudCheckins.ts`
3. `src/hooks/useCloudSettings.ts`

