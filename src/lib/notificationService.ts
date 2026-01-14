import { Capacitor } from '@capacitor/core';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { generateReminderTimes, NOTIFICATION_MESSAGES } from './reminderScheduler';
import type { AppSettings } from '@/types';

/**
 * NotificationService handles all native local notification operations.
 * On native platforms (iOS/Android), it uses Capacitor Local Notifications.
 * On web, it gracefully degrades with mock responses.
 */
class NotificationService {
  private isNative: boolean;
  private initialized: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Request notification permission from the user.
   * On iOS, this shows the native permission dialog.
   */
  async requestPermission(): Promise<PermissionStatus> {
    if (!this.isNative) {
      // Web fallback - pretend permission is granted
      return { display: 'granted' };
    }

    try {
      const result = await LocalNotifications.requestPermissions();
      console.log('[NotificationService] Permission result:', result);
      return result;
    } catch (error) {
      console.error('[NotificationService] Failed to request permission:', error);
      return { display: 'denied' };
    }
  }

  /**
   * Check current notification permission status.
   */
  async checkPermission(): Promise<PermissionStatus> {
    if (!this.isNative) {
      return { display: 'granted' };
    }

    try {
      return await LocalNotifications.checkPermissions();
    } catch (error) {
      console.error('[NotificationService] Failed to check permission:', error);
      return { display: 'denied' };
    }
  }

  /**
   * Schedule notifications based on user settings.
   * Cancels all existing notifications and schedules new ones for the next 7 days.
   */
  async scheduleReminders(settings: AppSettings): Promise<void> {
    if (!this.isNative) {
      console.log('[NotificationService] Web platform - skipping native scheduling');
      return;
    }

    if (!settings.notificationsEnabled) {
      console.log('[NotificationService] Notifications disabled - cancelling all');
      await this.cancelAllReminders();
      return;
    }

    // Check permission first
    const permission = await this.checkPermission();
    if (permission.display !== 'granted') {
      console.log('[NotificationService] Permission not granted - skipping');
      return;
    }

    try {
      // Cancel all existing scheduled notifications
      await this.cancelAllReminders();

      // Generate reminder times based on user settings
      const reminders = generateReminderTimes(
        settings.wakeTime,
        settings.bedTime,
        settings.notifSchedule.frequencyPreset,
        settings.reminderTypesEnabled,
        settings.quietHoursEnabled
      );

      if (reminders.times.length === 0) {
        console.log('[NotificationService] No reminders to schedule');
        return;
      }

      // Schedule notifications for next 7 days
      const notifications = [];
      const now = new Date();

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        for (let i = 0; i < reminders.times.length; i++) {
          const reminder = reminders.times[i];
          const scheduleDate = this.getScheduleDate(reminder.time, dayOffset);

          // Skip if this time has already passed today
          if (scheduleDate <= now) {
            continue;
          }

          const message = NOTIFICATION_MESSAGES[reminder.type];
          const notificationId = dayOffset * 100 + i + 1;

          notifications.push({
            id: notificationId,
            title: message.title,
            body: message.body,
            schedule: { at: scheduleDate },
            sound: 'default',
            actionTypeId: 'REMINDER_ACTION',
            extra: {
              type: reminder.type,
              label: reminder.label,
            },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`[NotificationService] Scheduled ${notifications.length} notifications`);
      }
    } catch (error) {
      console.error('[NotificationService] Failed to schedule reminders:', error);
    }
  }

  /**
   * Cancel all scheduled notifications.
   */
  async cancelAllReminders(): Promise<void> {
    if (!this.isNative) {
      return;
    }

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
        console.log(`[NotificationService] Cancelled ${pending.notifications.length} notifications`);
      }
    } catch (error) {
      console.error('[NotificationService] Failed to cancel reminders:', error);
    }
  }

  /**
   * Get count of pending notifications (for debugging/display).
   */
  async getPendingCount(): Promise<number> {
    if (!this.isNative) {
      return 0;
    }

    try {
      const pending = await LocalNotifications.getPending();
      return pending.notifications.length;
    } catch (error) {
      console.error('[NotificationService] Failed to get pending count:', error);
      return 0;
    }
  }

  /**
   * Register notification action listeners.
   * Called once on app startup to handle notification taps.
   */
  async registerListeners(onNotificationTap: (type: string) => void): Promise<void> {
    if (!this.isNative || this.initialized) {
      return;
    }

    try {
      // Handle notification received while app is in foreground
      await LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('[NotificationService] Received:', notification);
      });

      // Handle notification tap (action performed)
      await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('[NotificationService] Action performed:', action);
        const type = action.notification.extra?.type || 'checkin';
        onNotificationTap(type);
      });

      this.initialized = true;
      console.log('[NotificationService] Listeners registered');
    } catch (error) {
      console.error('[NotificationService] Failed to register listeners:', error);
    }
  }

  /**
   * Remove all notification listeners (cleanup).
   */
  async removeListeners(): Promise<void> {
    if (!this.isNative) {
      return;
    }

    try {
      await LocalNotifications.removeAllListeners();
      this.initialized = false;
      console.log('[NotificationService] Listeners removed');
    } catch (error) {
      console.error('[NotificationService] Failed to remove listeners:', error);
    }
  }

  /**
   * Helper to calculate the Date for a notification.
   */
  private getScheduleDate(timeString: string, dayOffset: number): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
