import { Capacitor } from '@capacitor/core';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { generateReminderTimes, NOTIFICATION_MESSAGES } from './reminderScheduler';
import type { AppSettings } from '@/types';
import { logger } from './logger';

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
      logger.log('[NotificationService] Permission result:', result);
      return result;
    } catch (error) {
      logger.error('[NotificationService] Failed to request permission:', error);
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
      logger.error('[NotificationService] Failed to check permission:', error);
      return { display: 'denied' };
    }
  }

  /**
   * Schedule notifications based on user settings.
   * Cancels all existing notifications and schedules new ones for the next 7 days.
   */
  async scheduleReminders(settings: AppSettings): Promise<void> {
    if (!this.isNative) {
      logger.log('[NotificationService] Web platform - skipping native scheduling');
      return;
    }

    if (!settings.notificationsEnabled) {
      logger.log('[NotificationService] Notifications disabled - cancelling all');
      await this.cancelAllReminders();
      return;
    }

    // Check permission first
    const permission = await this.checkPermission();
    if (permission.display !== 'granted') {
      logger.log('[NotificationService] Permission not granted - skipping');
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
        logger.log('[NotificationService] No reminders to schedule');
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
        logger.log(`[NotificationService] Scheduled ${notifications.length} notifications`);
      }
    } catch (error) {
      logger.error('[NotificationService] Failed to schedule reminders:', error);
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
        logger.log(`[NotificationService] Cancelled ${pending.notifications.length} notifications`);
      }
    } catch (error) {
      logger.error('[NotificationService] Failed to cancel reminders:', error);
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
      logger.error('[NotificationService] Failed to get pending count:', error);
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
        logger.log('[NotificationService] Received:', notification);
      });

      // Handle notification tap (action performed)
      await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        logger.log('[NotificationService] Action performed:', action);
        const type = action.notification.extra?.type || 'checkin';
        onNotificationTap(type);
      });

      this.initialized = true;
      logger.log('[NotificationService] Listeners registered');
    } catch (error) {
      logger.error('[NotificationService] Failed to register listeners:', error);
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
      logger.log('[NotificationService] Listeners removed');
    } catch (error) {
      logger.error('[NotificationService] Failed to remove listeners:', error);
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

  /**
   * Send a welcome notification for new signups.
   * Schedules a notification 5 seconds in the future.
   */
  async sendWelcomeNotification(): Promise<void> {
    if (!this.isNative) {
      logger.log('[NotificationService] Web platform - skipping welcome notification');
      return;
    }

    // Check permission first
    const permission = await this.checkPermission();
    if (permission.display !== 'granted') {
      logger.log('[NotificationService] Permission not granted - skipping welcome notification');
      return;
    }

    try {
      const scheduleDate = new Date();
      scheduleDate.setSeconds(scheduleDate.getSeconds() + 5); // 5 seconds delay

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99999, // Unique ID for welcome notification
            title: '🎉 Congrats on your new ink!',
            body: "We're excited to be part of your healing journey. We'll be with you every step of the way!",
            schedule: { at: scheduleDate },
            sound: 'default',
            extra: {
              type: 'welcome',
            },
          },
        ],
      });
      logger.log('[NotificationService] Welcome notification scheduled');
    } catch (error) {
      logger.error('[NotificationService] Failed to schedule welcome notification:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
