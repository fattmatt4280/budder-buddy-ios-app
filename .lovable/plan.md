

## Plan: Add Artist Name & Social Media Link to First Photo Prompt

### What Changes

**1. Database Migration**
Add an `artist_social_link` column to the `user_tattoos` table (nullable text, default null).

**2. Update `FirstPhotoPromptDialog.tsx`**
- Add two input fields (Artist Name, Social Media Link) between the description text and the action buttons
- Artist Name field pre-fills from the tattoo data if already provided during tattoo creation
- Social Media Link field is new (placeholder: "Instagram, TikTok, or website URL")
- On photo upload or "Take Photo", save the artist info to the tattoo record before proceeding
- Left-aligned text inputs, keeping the dialog compact

**3. Update `FirstPhotoPromptDialog` Props & Logic**
- Add `artistName` prop so it can pre-fill from the tattoo creation step
- On submit (Take Photo or Upload), call `updateTattoo()` to persist artist name and social link to the tattoo record
- Pass these through from `InkVaultScreen` and `PhotosScreen`

**4. Update `useCloudTattoos.ts`**
- Add `artistSocialLink` to the `Tattoo` type mapping (`cloudToLocal` / `localToCloud`)
- Handle the new `artist_social_link` column in update operations

**5. Update `Tattoo` type in `src/types/index.ts`**
- Add `artistSocialLink?: string` field

**6. Update callers** (`PhotosScreen.tsx`, `InkVaultScreen.tsx`)
- Pass `artistName` from the tattoo data into the `FirstPhotoPromptDialog`

### UI Behavior
- Fields only appear in the FirstPhotoPromptDialog (the "start a new heal" moment), not in AddTattooDialog's main flow (which already has artist/shop under "Optional")
- Both fields are optional -- user can still skip or go straight to photo
- Compact styling to keep the dialog mobile-friendly

