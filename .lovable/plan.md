
# Bring Ink Vault Experience to Photos Tab

## Summary
Enhance the Photos screen to mirror the Ink Vault experience:
1. Add stats overview and tattoo list display like Ink Vault
2. When user taps "Add" with no tattoo, show the full AddTattooDialog (with all the questions) before prompting for a photo
3. After adding tattoo details, show FirstPhotoPromptDialog to capture the photo

---

## Current vs. Proposed Flow

### Current Photos Screen Flow
- User taps "Add Your Tattoo" button
- Auto-creates a "quick tattoo" with defaults (body location = "Other", size = "Medium", etc.)
- Goes directly to Ghost Camera

### New Photos Screen Flow
- User taps "Add" button
- **AddTattooDialog opens** (same questions as Ink Vault):
  - When did you get it?
  - Body location
  - Size (Small/Medium/Large)
  - Ink type (Black & Grey / Color)
  - Artist name (optional)
  - Shop name (optional)
  - Notes (optional)
- After tattoo is created, **FirstPhotoPromptDialog opens**
- User can Take Photo, Upload, or Skip

---

## Changes Overview

| File | Changes |
|------|---------|
| `src/pages/PhotosScreen.tsx` | Add stats overview, import AddTattooDialog and FirstPhotoPromptDialog, update empty state to use full tattoo form |

---

## Visual Changes

### Stats Overview (New)
At the top of Photos screen, add the same 3-column stats from Ink Vault:
- Total Tattoos
- Fully Healed
- Healing Now

### Empty State (Updated)
Instead of auto-creating a "quick tattoo", the "Add Your Tattoo" button will now open the AddTattooDialog with all the form fields.

### With Tattoo State (Updated)
The header "Add" button will:
- If adding to existing tattoo: go directly to Ghost Camera (current behavior)
- If user wants to add new tattoo: open AddTattooDialog first

---

## Technical Implementation

### PhotosScreen Updates

1. **Import new components**:
```typescript
import AddTattooDialog from '@/components/vault/AddTattooDialog';
import FirstPhotoPromptDialog from '@/components/vault/FirstPhotoPromptDialog';
```

2. **Add state for dialogs**:
```typescript
const [addTattooDialogOpen, setAddTattooDialogOpen] = useState(false);
const [firstPhotoPrompt, setFirstPhotoPrompt] = useState<{
  tattooId: string;
  bodyLocation: string;
  tattooDate: string;
} | null>(null);
```

3. **Add callback for when tattoo is added**:
```typescript
const handleTattooAdded = (tattooId: string, bodyLocation: string, tattooDate: string) => {
  setFirstPhotoPrompt({ tattooId, bodyLocation, tattooDate });
};
```

4. **Update empty state button** to open AddTattooDialog instead of auto-creating tattoo

5. **Add stats overview section** showing total tattoos, healed count, and healing count

6. **Render both dialogs** at bottom of component

---

## User Flow Comparison

```text
BEFORE (Photos Screen):
"Add Your Tattoo" → Auto-create with defaults → Ghost Camera

AFTER (Photos Screen):
"Add Your Tattoo" → AddTattooDialog (full form) → FirstPhotoPromptDialog → Take Photo/Upload/Skip
```

This matches the Ink Vault experience exactly while keeping the Photos screen as the primary photo management view.
