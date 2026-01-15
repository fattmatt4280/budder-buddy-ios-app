# iOS Setup Guide for Budder Buddy

This guide covers the required iOS-specific configurations after exporting the project and running `npx cap add ios`.

## Privacy Purpose Strings (Required for App Store)

After running `npx cap add ios`, open `ios/App/App/Info.plist` in Xcode and add these entries inside the main `<dict>` tag:

```xml
<!-- Camera Access - Required for taking tattoo photos -->
<key>NSCameraUsageDescription</key>
<string>Budder Buddy uses your camera to take photos of your healing tattoo for progress tracking.</string>

<!-- Photo Library Read Access - Required for selecting existing photos -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Budder Buddy accesses your photo library to let you add existing tattoo photos to your healing journal.</string>

<!-- Photo Library Write Access - Required for saving photos -->
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Budder Buddy saves tattoo photos to your library for backup.</string>

<!-- Location Access - Required for Sun Guard UV monitoring -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Budder Buddy uses your location to check local UV levels and protect your healing tattoo from sun damage.</string>
```

## Local Notifications

The app uses **local notifications** via `@capacitor/local-notifications`. These don't require push notification entitlements or APNS setup - they're scheduled directly on the device.

**Note**: The `NSUserNotificationsUsageDescription` key is NOT required for local notifications on iOS. It's only needed for push notifications via APNS. The permission dialog will still appear when the app requests notification permission.

After building, notifications will:
- Request permission during onboarding
- Schedule 7 days of reminders based on user's wake/bed times
- Reschedule automatically when settings change
- Work offline (no server required)

## Environment Features

### Sun Guard (UV Monitoring)
The app includes a "Sun Guard" feature that checks local UV levels using the Open-Meteo API (free, no API key required). When enabled:
- Uses `@capacitor/geolocation` to get the user's position
- Fetches UV index from Open-Meteo forecast API
- Sends local notifications when UV is high (index > 5)
- Checks on app open and can be manually refreshed

### Safe to Submerge Countdown
A 14-day countdown timer shows users when it's safe to swim or visit the gym. A celebration notification is scheduled for day 14.

## App Icons & Splash Screen

1. Open `ios/App/App/Assets.xcassets` in Xcode
2. Replace the AppIcon image set with your app icons (all required sizes)
3. Configure the splash screen in `ios/App/App/Assets.xcassets/Splash.imageset`

### Required Icon Sizes

| Size | Scale | Usage |
|------|-------|-------|
| 20pt | 2x, 3x | Notifications |
| 29pt | 2x, 3x | Settings |
| 40pt | 2x, 3x | Spotlight |
| 60pt | 2x, 3x | App Icon |
| 1024pt | 1x | App Store |

## Build & Run Commands

```bash
# After cloning and installing dependencies
npm install

# Add iOS platform (first time only)
npx cap add ios

# Build the web app
npm run build

# Sync web assets to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Or run directly on device/simulator
npx cap run ios
```

## Xcode Project Settings

### General Tab
- **Display Name**: Budder Buddy
- **Bundle Identifier**: app.lovable.f8e96625555b4f769c477869ccd21511
- **Deployment Target**: iOS 14.0 or higher recommended

### Signing & Capabilities
1. Select your Development Team
2. Enable "Automatically manage signing"
3. Add capabilities as needed (e.g., Push Notifications when implemented)

## Troubleshooting

### Permission Dialogs Not Appearing
- Ensure the privacy strings are correctly added to Info.plist
- Clean build folder (Cmd + Shift + K) and rebuild

### Camera/Photos Not Working
- Check that the privacy strings match the keys exactly
- Verify the app has the required permissions in Settings > Privacy

### Ghost Camera Preview Not Visible
- The app uses `@capacitor-community/camera-preview` which renders the camera behind a transparent webview
- Ensure no opaque backgrounds are covering the camera preview
- On simulators, camera preview may not work - test on a real device

### Secure Storage Issues
- The app uses Keychain for credential storage via `capacitor-secure-storage-plugin`
- Keychain access is automatically configured by Capacitor

## Security Notes

- Auth tokens are stored in iOS Keychain (not localStorage)
- All network traffic uses HTTPS (ATS compliant)
- Debug logging is disabled in production builds (via `src/lib/logger.ts`)
- No sensitive data is written to user-visible logs

## Crash Reporting (Future Consideration)

The app currently does not include crash reporting. If implementing in the future:

1. **Recommended Services**: Sentry (`@sentry/react`) or Firebase Crashlytics
2. **Privacy Requirements**:
   - Enable PII scrubbing before sending reports
   - Ensure no user photos or tattoo data appear in crash logs
   - Update Privacy Policy Section 2B to reflect data collection
3. **Implementation Notes**:
   - Wrap app in React error boundary
   - Initialize crash reporting only in production
   - Test that sensitive local storage data is not included in reports

## Release Build Checklist

Before submitting to App Store, verify these Xcode settings:

### Build Settings (Release Scheme)
- [ ] "Strip Debug Symbols During Copy" = YES
- [ ] "Debug Information Format" = DWARF (not DWARF with dSYM for public builds)
- [ ] "Enable Testability" = NO
- [ ] "Validate Built Product" = YES

### Entitlements
Verify only required entitlements are enabled:
- [ ] Remove any unused entitlements
- [ ] App Groups (only if using shared data between extensions)

**Note**: Local notifications do NOT require the Push Notifications entitlement.

### Archive Validation
- [ ] Product > Archive produces a valid archive
- [ ] Organizer > Validate App passes all checks
- [ ] Test on a real device before submission

### Privacy Manifest (iOS 17+)
For iOS 17 and later, Apple may require a privacy manifest. Capacitor handles this automatically in most cases, but verify:
- [ ] No third-party SDKs require additional privacy manifest entries
- [ ] Required reason APIs are properly documented if used
