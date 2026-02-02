
# Plan: Sync Tattoos, Settings, and Check-ins to Your Account

## The Problem

Right now, your **photos are saved to the cloud** (and they're still there!), but your **tattoos, reminder settings, and daily check-ins are only stored in your browser's local storage**. This means:

- When you sign out and back in, the app can't find any tattoo records
- Without tattoo records, the app doesn't know how to display your photos
- Your reminder settings and check-in history are also lost

## The Solution

We'll save all your data to your account so it syncs across sessions and devices.

```text
+------------------+       +------------------+       +------------------+
|    Browser A     |       |     Backend      |       |    Browser B     |
|                  |       |                  |       |                  |
| - Tattoos        | <---> | - tattoos table  | <---> | - Tattoos        |
| - Settings       |       | - settings table |       | - Settings       |
| - Check-ins      |       | - checkins table |       | - Check-ins      |
| - Photos         |       | - photos table   |       | - Photos         |
+------------------+       +------------------+       +------------------+
```

---

## What Will Change

### 1. New Database Tables

**`user_tattoos` table** - Stores your tattoo records
- Links to your user account
- Contains: body location, size, ink type, tattoo date, artist name, shop name, notes, healed status

**`user_settings` table** - Stores your app preferences
- Reminder schedule (wake time, bed time, frequency)
- Notification preferences
- Selected tattoo ID
- Other app settings

**`user_checkins` table** - Stores your daily check-in history
- Linked to specific tattoos
- Contains: day number, checklist completion, notes, observations

### 2. Automatic Data Sync

When you **sign in**:
1. Fetch your tattoos, settings, and check-ins from the cloud
2. If the cloud is empty but local data exists, import it to your account
3. Display your data as before

When you **make changes** (add tattoo, update settings, complete a check-in):
1. Save to local storage (for fast access)
2. Save to the cloud (for persistence)

### 3. First-Time Import

Since you already have data from last night, we'll automatically import any locally-stored data to your account when it detects cloud is empty but local isn't.

---

## Technical Details

### Database Schema

```sql
-- Tattoos table
CREATE TABLE user_tattoos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL,  -- Maps to the ID used in photos table
  tattoo_date DATE NOT NULL,
  body_location TEXT NOT NULL,
  size_tier TEXT NOT NULL,
  ink_type TEXT NOT NULL,
  artist_name TEXT,
  shop_name TEXT,
  notes TEXT,
  is_healed BOOLEAN DEFAULT FALSE,
  healed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, local_id)
);

-- Settings table (one row per user)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Check-ins table
CREATE TABLE user_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tattoo_local_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  checkin_date DATE NOT NULL,
  checklist JSONB NOT NULL,
  user_notes TEXT,
  observations TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tattoo_local_id, day_number)
);
```

### New Sync Hooks

**`useCloudTattoos`** - Manages tattoo sync
- Fetches tattoos on mount when authenticated
- Provides `addTattoo`, `updateTattoo`, `deleteTattoo` that write to both local and cloud
- Includes import logic for existing local data

**`useCloudSettings`** - Manages settings sync
- Loads settings from cloud on sign-in
- Saves settings changes to cloud
- Merges with defaults for any missing fields

**`useCloudCheckins`** - Manages check-in sync
- Fetches check-ins on mount
- Saves new check-ins to cloud
- Links to tattoos via `local_id`

### Migration of Existing Data

When the user signs in and cloud is empty:
1. Read local `budder_tattoos`, `budder_settings`, `budder_checkins`
2. Upload each to the corresponding cloud table
3. The existing `photos` table already uses the local tattoo ID, so they'll automatically connect

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/` | New migration for 3 tables + RLS policies |
| `src/hooks/useCloudTattoos.ts` | New hook for cloud tattoo sync |
| `src/hooks/useCloudSettings.ts` | New hook for cloud settings sync |
| `src/hooks/useCloudCheckins.ts` | New hook for cloud check-in sync |
| `src/hooks/useStorage.ts` | Update to use cloud hooks when authenticated |
| `src/App.tsx` | Minor updates to pass auth state |

---

## Security

All new tables will have Row-Level Security (RLS) enabled:
- Users can only read/write their own data
- Policies match the existing `photos` table pattern
