

## Plan: Simplify Ghost Camera — Fixed 20% Opacity, No Slider

### Changes

**1. `src/pages/GhostCameraScreen.tsx`**
- Remove `ghostOpacity` state — replace with a constant `20`
- Remove `showGhost` / `setShowGhost` toggle state — ghost is always on when an image exists
- Pass fixed values to `GhostOverlay` and `CameraControls`
- After native capture, composite the ghost image onto the captured photo at 20% opacity using a new `cameraService.compositeImages()` method (so the saved photo includes the ghost)

**2. `src/components/camera/CameraControls.tsx`**
- Remove the opacity slider section entirely
- Remove the ghost toggle button (Eye/EyeOff)
- Remove `ghostOpacity`, `onOpacityChange`, `showGhost`, `onToggleGhost`, `hasGhostImage` props
- Keep only: capture button, close button, flip button
- Remove the "Align your tattoo" hint text (no longer needed since ghost is always visible)

**3. `src/components/camera/GhostOverlay.tsx`**
- No changes needed (already accepts opacity + visible props)

**4. `src/lib/cameraService.ts`**
- Add `compositeImages(cameraBase64: string, ghostImageUrl: string, ghostOpacity: number): Promise<File>` method
- Draws camera image on canvas, then draws ghost image on top at given opacity
- Returns compressed File (1280px max, JPEG 0.82)

### Flow After Changes
1. User opens Ghost Camera
2. Ghost image (most recent photo) appears immediately at 20% opacity over the live camera
3. User sees both live feed + ghost overlay simultaneously
4. User taps capture → photo is taken with ghost composited in at 20%
5. No sliders, no toggles — clean single-action experience

