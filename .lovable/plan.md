

# Add First Photo Prompt After Tattoo Creation

## Summary
After a user manually adds a new tattoo in the Ink Vault, display a prompt dialog asking them to capture their first photo or upload an existing "finished product" photo. This ensures new tattoos immediately have a Day 1 photo for the healing timeline.

---

## Changes Overview

| File | Changes |
|------|---------|
| `src/components/vault/AddTattooDialog.tsx` | Return newly created tattoo ID via callback |
| `src/pages/InkVaultScreen.tsx` | Add new `FirstPhotoPromptDialog` and handle post-creation flow |
| `src/components/vault/FirstPhotoPromptDialog.tsx` | New component for the photo prompt modal |

---

## Detailed Implementation

### 1. Create FirstPhotoPromptDialog Component

A new dialog that appears after adding a tattoo, offering two options:
- **Take Photo**: Opens the Ghost Camera for Day 1 capture
- **Upload Photo**: Opens file picker to upload an existing image

```text
+------------------------------------------+
|                                          |
|     📸  Add Your First Photo             |
|                                          |
|  Capture your fresh ink to start         |
|  tracking your healing journey!          |
|                                          |
|  +----------------+  +----------------+  |
|  | 📷 Take Photo  |  | 🖼️ Upload      |  |
|  +----------------+  +----------------+  |
|                                          |
|           [Skip for Now]                 |
+------------------------------------------+
```

**Props:**
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `tattooId: string` - The newly created tattoo ID
- `tattooLocation: string` - For display in the dialog

### 2. Update AddTattooDialog

Modify to return the newly created tattoo data via an `onTattooAdded` callback:

**New prop:**
```typescript
interface AddTattooDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTattooAdded?: (tattooId: string, bodyLocation: string) => void;
}
```

**In handleSubmit:**
After adding the tattoo and before closing, call the callback with the new tattoo's ID and body location.

### 3. Update InkVaultScreen

Add state and logic to handle the post-creation flow:

**New state:**
```typescript
const [firstPhotoPrompt, setFirstPhotoPrompt] = useState<{
  tattooId: string;
  bodyLocation: string;
} | null>(null);
```

**Handle tattoo added:**
```typescript
const handleTattooAdded = (tattooId: string, bodyLocation: string) => {
  setFirstPhotoPrompt({ tattooId, bodyLocation });
};
```

**Pass callback to AddTattooDialog:**
```tsx
<AddTattooDialog 
  open={addDialogOpen} 
  onOpenChange={setAddDialogOpen}
  onTattooAdded={handleTattooAdded}
/>
```

**Add FirstPhotoPromptDialog:**
```tsx
<FirstPhotoPromptDialog
  open={firstPhotoPrompt !== null}
  onOpenChange={(open) => !open && setFirstPhotoPrompt(null)}
  tattooId={firstPhotoPrompt?.tattooId}
  tattooLocation={firstPhotoPrompt?.bodyLocation}
/>
```

---

## FirstPhotoPromptDialog Details

### Component Structure

```typescript
interface FirstPhotoPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tattooId?: string;
  tattooLocation?: string;
}
```

### Features

1. **Take Photo button**: 
   - Navigates to `/ghost-camera` with `tattooId` in state
   - Closes the dialog

2. **Upload Photo button**:
   - Triggers a hidden file input
   - Compresses and uploads to cloud storage
   - Shows success toast
   - Closes dialog and navigates to photos

3. **Skip for Now link**:
   - Simply closes the dialog
   - User can add photos later from the Photos screen

### Visual Design

- Uses the same custom modal pattern as AddTattooDialog (flexbox centered, backdrop blur)
- Same `liquid-glass-card` styling for consistency
- Camera and image icons for visual clarity
- Friendly, encouraging copy

---

## User Flow

```text
User taps "Add" in Ink Vault
        |
        v
AddTattooDialog opens
        |
        v
User fills in tattoo details → taps "Add to Vault"
        |
        v
Tattoo saved, dialog closes
        |
        v
FirstPhotoPromptDialog opens immediately
        |
   +----+----+----+
   |         |    |
   v         v    v
Take     Upload  Skip
Photo    Photo   
   |         |    |
   v         v    v
Ghost    File   Close
Camera   picker  dialog
   |         |    |
   v         v    v
Photo captured/uploaded → Photos screen
```

---

## Technical Notes

- File upload uses the existing `useCloudPhotos().uploadPhoto()` hook
- Image compression uses `cameraService.compressImage()` for consistency
- Day number is calculated using `getDayNumber(tattooDate)` from the new tattoo
- Ghost Camera navigation includes `tattooId` in location state
- Requires user to be authenticated (same as other photo features)

