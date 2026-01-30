

# Timelapse Download + Manual "Mark Healed" Feature

## Summary
Add two new features for completed tattoo healing journeys:
1. **Timelapse Download**: Generate and download a GIF/video timelapse from all photos taken during the healing process
2. **Manual "Mark as Healed" Trigger**: Allow users to manually mark a tattoo as healed, which turns off all notifications for that tattoo

---

## Current State Analysis

| Component | Current Behavior |
|-----------|-----------------|
| Tattoo Type | No `isHealed` or `healedDate` property |
| Healing Detection | Based on `getDayNumber() > 30` (automatic) |
| Photos | Stored in Supabase `tattoo-photos` bucket with day numbers |
| Notifications | Scheduled via `notificationService` based on `settings.notificationsEnabled` |

---

## Changes Overview

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `isHealed` and `healedDate` properties to Tattoo type |
| `src/lib/timelapseService.ts` | New service to generate GIF from photos using gifshot library |
| `src/components/vault/TattooVaultCard.tsx` | Add "Mark as Healed" button and "Download Timelapse" button |
| `src/hooks/useStorage.ts` | Update default settings handling |
| `src/pages/InkVaultScreen.tsx` | Update healing status logic to respect manual `isHealed` flag |

---

## Detailed Implementation

### 1. Update Tattoo Type (`src/types/index.ts`)

Add new optional properties to track manual healing status:

```typescript
export interface Tattoo {
  id: string;
  createdAt: string;
  tattooDate: string;
  bodyLocation: string;
  sizeTier: SizeTier;
  inkType: InkType;
  artistName?: string;
  shopName?: string;
  notes?: string;
  // NEW: Manual healing control
  isHealed?: boolean;
  healedDate?: string; // ISO date when marked healed
}
```

### 2. Create Timelapse Service (`src/lib/timelapseService.ts`)

New service using the `gifshot` library to create animated GIFs from healing photos:

```typescript
// Key functionality:
// - Accept array of image URLs sorted by day number
// - Load images and draw to canvas
// - Add day number overlay to each frame
// - Generate GIF using gifshot library
// - Trigger download with filename like "tattoo-timelapse-forearm.gif"

export async function generateTimelapse(
  photos: { imageUrl: string; dayNumber: number }[],
  tattooName: string
): Promise<{ success: boolean; error?: string }>
```

**Why GIF over MP4:**
- Better browser compatibility (no codec issues)
- No external dependencies for encoding
- Smaller file sizes for the ~30 frames we'll have
- Easy to share on social media

### 3. Update TattooVaultCard (`src/components/vault/TattooVaultCard.tsx`)

Add two new action buttons in the expanded card view:

**For Active (healing) tattoos:**
- "Mark as Healed" button with confirmation dialog
- When clicked: Sets `isHealed: true`, `healedDate: today`, and disables notifications

**For Healed tattoos (either manual or 30+ days):**
- "Download Timelapse" button (only if 2+ photos exist)
- Shows loading state while generating
- Downloads GIF automatically

```text
+------------------------------------------+
|  [Healing Diary Stats Grid]              |
+------------------------------------------+
|  Actions:                                |
|  [Set as Active]  [Edit] [Delete]        |
|  [Mark as Healed]  OR  [Download Timelapse]  |
+------------------------------------------+
```

### 4. Notification Handling on Mark Healed

When user marks tattoo as healed:

1. Update tattoo record with `isHealed: true` and `healedDate`
2. If this is the currently selected tattoo (`settings.selectedTattooId`):
   - Set `notificationsEnabled: false`
   - Cancel all pending notifications via `notificationService.cancelAllReminders()`
3. Show success toast: "Tattoo marked as healed! Notifications turned off."

### 5. Update InkVaultScreen Logic

Modify the active/archived separation to respect manual healing:

```typescript
// A tattoo is "active" if:
// - NOT manually marked healed AND
// - Less than 30 days since tattoo date

const activeTattoos = sortedTattoos.filter(t => 
  !t.isHealed && getDayNumber(t.tattooDate) <= 30
);

const archivedTattoos = sortedTattoos.filter(t => 
  t.isHealed || getDayNumber(t.tattooDate) > 30
);
```

---

## Timelapse Generation Flow

```text
User clicks "Download Timelapse"
           |
           v
    Fetch all photos for tattoo
    (sorted by dayNumber ascending)
           |
           v
    At least 2 photos?
    No --> Show toast "Need 2+ photos"
    Yes --> Continue
           |
           v
    Show loading indicator
           |
           v
    Load all images into canvas
    Add "Day X" overlay text
           |
           v
    Generate GIF via gifshot
    (500ms per frame, 800px wide)
           |
           v
    Trigger browser download
    "healing-timelapse-[location].gif"
           |
           v
    Show success toast
```

---

## Mark as Healed Confirmation

Display an AlertDialog before marking healed:

| Field | Content |
|-------|---------|
| Title | "Mark as Healed?" |
| Description | "This will move your tattoo to the Healed Archive and turn off all reminders. You can still view your healing journey and download a timelapse." |
| Cancel | "Keep Healing" |
| Confirm | "Yes, It's Healed" |

---

## New Dependency

Install `gifshot` for GIF generation:

```json
"gifshot": "^0.4.5"
```

This is a lightweight (30KB) client-side library specifically designed for creating GIFs from images in the browser.

---

## User Experience Summary

**Marking a tattoo as healed:**
1. Go to Ink Vault
2. Expand the healing tattoo card
3. Tap "Mark as Healed"
4. Confirm in dialog
5. Tattoo moves to "Healed Archive" section
6. Notifications automatically turn off
7. "Download Timelapse" button becomes available

**Downloading timelapse:**
1. Go to Ink Vault
2. Expand a healed tattoo card
3. Tap "Download Timelapse"
4. Wait for generation (~2-5 seconds)
5. GIF automatically downloads to device

