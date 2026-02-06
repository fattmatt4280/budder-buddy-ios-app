

# Fix iOS Notifications Not Working in TestFlight

## Problem Summary
Several issues in the notification service prevent notifications from firing on iOS TestFlight builds. The core problems are: unregistered action types that can cause iOS to silently suppress notifications, and production logging being suppressed which makes it impossible to debug on TestFlight.

## Issues Found

### Issue 1: Unregistered Action Type (Most Likely Cause)
Every scheduled notification includes `actionTypeId: 'REMINDER_ACTION'` (line 120 of `notificationService.ts`), but the app **never calls** `LocalNotifications.registerActionTypes()` to define this action type. On iOS, referencing an unregistered action type can cause the system to silently drop or suppress the notification.

### Issue 2: No Initialization on App Launch
The notification listeners are registered in `main.tsx`, but the app never re-schedules pending notifications on launch. If the app was killed or updated via TestFlight, all previously scheduled notifications may be lost. There is no "boot-up" check to verify and reschedule.

### Issue 3: Silent Permission Check Failure
In `scheduleReminders()`, the permission check on line 73-77 returns early if permission status is not `'granted'`. If there is any timing issue where the permission status returns `'prompt'` instead of `'granted'` (even after the user accepted), all scheduling is silently skipped. Since `logger.log` is suppressed in production (TestFlight), this failure is completely invisible.

### Issue 4: No Debug Visibility in TestFlight
The `logger.ts` utility suppresses all `log`, `warn`, and `debug` calls in production. TestFlight builds are production builds, so none of the notification scheduling logs appear. This makes it impossible to know if notifications were actually scheduled or if permission checks failed.

---

## Implementation Plan

### Step 1: Register Action Types on Startup
Add a call to `LocalNotifications.registerActionTypes()` in the notification service initialization. This tells iOS about the `REMINDER_ACTION` category so notifications using it are not suppressed.

```text
Location: src/lib/notificationService.ts
Change: Add an initialize() method that registers action types
Call it from: src/main.tsx during app startup
```

### Step 2: Remove actionTypeId from Scheduled Notifications
As a safety measure, remove the `actionTypeId: 'REMINDER_ACTION'` from the notification schedule call. The notification tap handler already works by listening to `localNotificationActionPerformed` events regardless of action type. Removing this eliminates the risk of iOS suppressing notifications due to unregistered types.

```text
Location: src/lib/notificationService.ts, line 120
Change: Remove the actionTypeId property from the notification object
```

### Step 3: Add Boot-Up Notification Verification
After app launch, check if notifications are enabled in settings and if any are actually pending. If settings say notifications should be active but none are pending (e.g., after a TestFlight update), automatically reschedule them.

```text
Location: src/main.tsx or a new useNotificationBootstrap hook
Change: After auth/settings load, verify pending count matches expectations
        and reschedule if needed
```

### Step 4: Add Critical Notification Logging
For notification-related operations, use `console.error` (which is never suppressed) for critical status messages so they appear in TestFlight device logs. This will help verify the fix is working.

```text
Location: src/lib/notificationService.ts
Change: Use console.error for key milestone logs:
  - Permission check result
  - Number of notifications scheduled
  - Any scheduling failures
```

### Step 5: Add a "Send Test Notification" Button in Settings
Add a debug/test button in the Settings screen that schedules a single notification 5 seconds in the future. This gives you an immediate way to verify notifications are working on the device without waiting for a scheduled time.

```text
Location: src/pages/SettingsScreen.tsx
Change: Add a "Test Notification" button in the Reminders section
        that fires a test notification after 5 seconds
```

---

## Technical Details

### Files to Modify

1. **src/lib/notificationService.ts**
   - Add `initialize()` method to register action types
   - Remove `actionTypeId` from scheduled notifications
   - Add `sendTestNotification()` method for debugging
   - Add `verifyAndReschedule()` method for boot-up check
   - Upgrade critical log statements to `console.error` for TestFlight visibility

2. **src/main.tsx**
   - Call `notificationService.initialize()` during startup

3. **src/pages/SettingsScreen.tsx**
   - Add "Send Test Notification" button in the Reminders section

4. **src/components/layout/AppLayout.tsx** (or a new hook)
   - Add boot-up notification verification that runs once when the app loads with valid settings

---

## After Implementation

After these changes are deployed, you will need to:
1. Pull the latest code from GitHub
2. Run `npm install` (no new dependencies needed)
3. Run `npx cap sync ios`
4. Rebuild and deploy to TestFlight
5. On the device, go to Settings and tap "Send Test Notification" to verify it works
6. If you previously denied notification permission, delete and reinstall the app to reset permissions

