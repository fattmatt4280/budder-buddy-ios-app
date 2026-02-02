

# Fix iOS Camera Permissions for Ghost Camera

## Problem Summary
The camera isn't asking for permissions on iOS TestFlight because the `@capacitor-community/camera-preview` plugin doesn't have permission-requesting methods. When you try to start the camera without granted permissions, iOS silently denies access instead of showing the permission prompt.

## Solution Overview
We'll add the official `@capacitor/camera` plugin which provides proper permission methods, then update the camera service to request permissions before starting the camera preview.

---

## Implementation Steps

### Step 1: Install the @capacitor/camera Plugin
Add the official Capacitor camera plugin which has permission methods:
- Install `@capacitor/camera` package
- This plugin provides `checkPermissions()` and `requestPermissions()` methods

### Step 2: Update Camera Service with Permission Handling
Modify `src/lib/cameraService.ts` to:
- Import `Camera` from `@capacitor/camera`
- Add a new `requestCameraPermission()` function that:
  - Checks current permission status
  - Requests permission if not granted
  - Returns `true` if granted, `false` if denied
- Modify the `start()` function to request permission first before starting the preview
- Add an `openSettings()` function to guide users to app settings if permission was permanently denied

### Step 3: Update Ghost Camera Screen for Permission Flow
Modify `src/pages/GhostCameraScreen.tsx` to:
- Check permission status on mount
- Show a friendly permission request screen if permission hasn't been granted
- Handle the "permanently denied" case by showing a button to open Settings
- Only start the camera preview after permission is confirmed

### Step 4: Update iOS Documentation
Update `docs/IOS_SETUP.md` to note that `@capacitor/camera` is now also required and its permissions are shared with camera-preview.

---

## Technical Details

### Permission Flow Diagram
```text
User taps camera button
        │
        ▼
Check camera permission status
        │
        ├─── Already Granted ───► Start camera preview
        │
        ├─── Not Yet Asked ───► Show permission dialog
        │                              │
        │                              ├─── User allows ───► Start camera
        │                              └─── User denies ───► Show error
        │
        └─── Previously Denied ───► Show "Open Settings" button
```

### New Camera Permission Method (cameraService.ts)
```typescript
import { Camera, CameraPermissionType } from '@capacitor/camera';

async requestCameraPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!isNative) return 'granted'; // Web doesn't need this

  try {
    const status = await Camera.checkPermissions();
    
    if (status.camera === 'granted') {
      return 'granted';
    }
    
    if (status.camera === 'denied') {
      // User previously denied - can't re-prompt, need to go to Settings
      return 'denied';
    }
    
    // Permission not yet asked - request it
    const request = await Camera.requestPermissions({ permissions: ['camera'] });
    return request.camera === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    console.error('[CameraService] Permission check failed:', error);
    return 'denied';
  }
}
```

### Updated Ghost Camera Screen Flow
The screen will show different UI states:
1. **Loading** - Checking permission status
2. **Permission Required** - Button to request permission (first time)
3. **Permission Denied** - Button to open Settings with explanation
4. **Camera Ready** - Normal camera preview with ghost overlay

---

## After Implementation

After I implement these changes, you'll need to:
1. Pull the latest code from GitHub
2. Run `npm install` to get the new `@capacitor/camera` package
3. Run `npx cap sync ios` to sync the new plugin
4. Rebuild and test on device/TestFlight

The permission dialog should now appear when you first try to use the camera. If you previously denied permission during testing, you may need to:
- Go to iOS Settings > Budder Buddy > Camera and enable it manually
- Or delete and reinstall the app to reset permissions

