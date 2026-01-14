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
```

### Future: Push Notifications

When implementing native push notifications, add:

```xml
<key>NSUserNotificationsUsageDescription</key>
<string>Budder Buddy sends reminders to help you care for your healing tattoo on schedule.</string>
```

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

### Secure Storage Issues
- The app uses Keychain for credential storage via `capacitor-secure-storage-plugin`
- Keychain access is automatically configured by Capacitor

## Security Notes

- Auth tokens are stored in iOS Keychain (not localStorage)
- All network traffic uses HTTPS (ATS compliant)
- No sensitive data is written to logs in production
