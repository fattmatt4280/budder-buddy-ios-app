

# Multi-Image Support for Tattoo Wishlist

## Overview
Currently each wishlist item supports a single reference image. This plan upgrades it to allow multiple reference images per wishlist idea -- perfect for collecting inspiration from different angles, styles, or artists.

## Approach
Create a new `wishlist_images` table to store multiple images per wishlist item (replacing the single `image_path` column), then update the hook and UI to support selecting, displaying, and deleting multiple images.

## Database Changes

**New table: `wishlist_images`**
- `id` (uuid, primary key)
- `wishlist_item_id` (uuid, foreign key to `tattoo_wishlist.id`, ON DELETE CASCADE)
- `user_id` (uuid, for RLS)
- `storage_path` (text) -- path in `wishlist-images` bucket
- `sort_order` (integer, default 0)
- `created_at` (timestamptz)

RLS policies: users can SELECT, INSERT, DELETE their own rows (matched by `user_id`).

The existing `image_path` column on `tattoo_wishlist` will be kept for now (backward compatibility) but new code will read from the new table. A one-time data migration will move any existing `image_path` values into the new table.

## Hook Changes (`src/hooks/useWishlist.ts`)

- Update `WishlistItem` interface: replace single `imagePath`/`imageUrl` with `images: { id, storagePath, url }[]`
- `fetchItems`: join or separately query `wishlist_images` for each item, generate signed URLs for all images
- `addItem`: accept `imageFiles?: File[]` (array), upload each, insert rows into `wishlist_images`
- `deleteItem`: remove all associated images from storage (CASCADE handles DB rows)
- Add `addImages(itemId, files)` and `removeImage(imageId)` helpers for managing images on existing items

## UI Changes (`src/components/vault/WishlistSection.tsx`)

**Add Form:**
- Change file input to accept `multiple`
- Track `imageFiles: File[]` and `imagePreviews: string[]` arrays
- Show a horizontal scrollable row of thumbnail previews with individual remove buttons
- Update label from "Reference Image" to "Reference Images"

**WishlistCard (expanded view):**
- Display images in a horizontally scrollable row or small grid instead of a single large image
- Each image tappable to view full-size (optional: simple lightbox or just larger inline view)
- Show image count badge on the collapsed card thumbnail (e.g. "+3")

## Technical Details

```text
tattoo_wishlist              wishlist_images
+------------------+         +-------------------+
| id (PK)          |----<----| wishlist_item_id   |
| user_id          |         | user_id            |
| title            |         | storage_path       |
| image_path (old) |         | sort_order         |
| ...              |         | created_at         |
+------------------+         +-------------------+
```

- Storage bucket (`wishlist-images`) stays the same -- no changes needed
- Migration SQL will copy existing `image_path` data into `wishlist_images` rows, then the column can optionally be dropped later
- File input uses `multiple` attribute; each file uploaded with a unique timestamped path
- Signed URLs generated in batch for all images per item

## Files Modified
1. **Database migration** -- new `wishlist_images` table + RLS + data migration
2. **`src/hooks/useWishlist.ts`** -- multi-image support in all CRUD operations
3. **`src/components/vault/WishlistSection.tsx`** -- multi-file picker UI + multi-image display

