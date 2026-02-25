

# Remove Back Button from Login Screen

## Change
Remove the header section containing the back arrow button from the Auth screen. This is lines 127-134 in `src/pages/AuthScreen.tsx`:

```text
{/* Header */}
<div className="flex items-center gap-3 px-4 pt-4">
  <button
    onClick={() => navigate(-1)}
    className="w-10 h-10 rounded-full liquid-glass-light flex items-center justify-center"
  >
    <ArrowLeft className="w-5 h-5 text-foreground" />
  </button>
</div>
```

This entire block will be deleted. The `ArrowLeft` import from `lucide-react` will also be removed since it's no longer used.

## Technical Details

**File:** `src/pages/AuthScreen.tsx`
- Remove the `ArrowLeft` icon from the lucide-react import (line 6)
- Delete the header `<div>` block (lines 127-134)

One small change, no other files affected.
