import { Capacitor } from '@capacitor/core';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { generateReminderTimes, NOTIFICATION_MESSAGES } from './reminderScheduler';
import type { AppSettings } from '@/types';
import { logger } from './logger';

/**
 * Critical notification log - always visible, even in production/TestFlight.
 * Uses console.error so it's never suppressed by the logger utility.
 */
function notifLog(message: string, ...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(`[Notif] ${message}`, ...args);
}

/**
 * NotificationService handles all native local notification operations.
 * On native platforms (iOS/Android), it uses Capacitor Local Notifications.
 * On web, it gracefully degrades with mock responses.
 */
class NotificationService {
  private isNative: boolean;
  private listenersRegistered: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Initialize the notification service on app startup.
   * Registers action types so iOS doesn't suppress notifications.
   */
  async initialize(): Promise<void> {
    if (!this.isNative) return;

    try {
      // Register action types BEFORE scheduling any notifications.
      // Without this, iOS may silently suppress notifications that
      // reference an unregistered actionTypeId.
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'REMINDER_ACTION',
            actions: [],
          },
        ],
      });
      notifLog('Action types registered');
    } catch (error) {
      notifLog('Failed to register action types:', error);
    }
  }

  /**
   * Request notification permission from the user.
   * On iOS, this shows the native permission dialog.
   */
  async requestPermission(): Promise<PermissionStatus> {
    if (!this.isNative) {
      return { display: 'granted' };
    }

    try {
      notifLog('Requesting permission...');
      const result = await LocalNotifications.requestPermissions();
      notifLog('Permission result:', result.display);
      return result;
    } catch (error) {
      notifLog('Failed to request permission:', error);
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
      const result = await LocalNotifications.checkPermissions();
      notifLog('Permission status:', result.display);
      return result;
    } catch (error) {
      notifLog('Failed to check permission:', error);
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
      notifLog('Notifications disabled - cancelling all');
      await this.cancelAllReminders();
      return;
    }

    // Check permission first
    const permission = await this.checkPermission();
    if (permission.display !== 'granted') {
      notifLog('Permission NOT granted (' + permission.display + ') - skipping scheduling');
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
        notifLog('No reminders to schedule (0 time slots)');
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
            extra: {
              type: reminder.type,
              label: reminder.label,
            },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        notifLog(`Scheduled ${notifications.length} notifications for next 7 days`);
      } else {
        notifLog('All notification times are in the past - nothing scheduled');
      }
    } catch (error) {
      notifLog('FAILED to schedule reminders:', error);
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
        notifLog(`Cancelled ${pending.notifications.length} pending notifications`);
      }
    } catch (error) {
      notifLog('Failed to cancel reminders:', error);
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
      notifLog('Failed to get pending count:', error);
      return 0;
    }
  }

  /**
   * Verify notifications are properly scheduled and reschedule if needed.
   * Called on app boot to recover from app kills or TestFlight updates.
   */
  async verifyAndReschedule(settings: AppSettings): Promise<void> {
    if (!this.isNative) return;
    if (!settings.notificationsEnabled) return;

    try {
      const permission = await this.checkPermission();
      if (permission.display !== 'granted') {
        notifLog('Boot check: permission not granted, skipping reschedule');
        return;
      }

      const pendingCount = await this.getPendingCount();
      notifLog(`Boot check: ${pendingCount} pending notifications`);

      // If notifications should be active but none are pending, reschedule
      if (pendingCount === 0) {
        notifLog('Boot check: 0 pending but notifications enabled - rescheduling');
        await this.scheduleReminders(settings);
      }
    } catch (error) {
      notifLog('Boot check failed:', error);
    }
  }

  /**
   * Register notification action listeners.
   * Called once on app startup to handle notification taps.
   */
  async registerListeners(onNotificationTap: (type: string) => void): Promise<void> {
    if (!this.isNative || this.listenersRegistered) {
      return;
    }

    try {
      // Handle notification received while app is in foreground
      await LocalNotifications.addListener('localNotificationReceived', (notification) => {
        notifLog('Received in foreground:', notification.title);
      });

      // Handle notification tap (action performed)
      await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        notifLog('Notification tapped:', action.notification.title);
        const type = action.notification.extra?.type || 'checkin';
        onNotificationTap(type);
      });

      this.listenersRegistered = true;
      notifLog('Listeners registered');
    } catch (error) {
      notifLog('Failed to register listeners:', error);
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
      this.listenersRegistered = false;
      logger.log('[NotificationService] Listeners removed');
    } catch (error) {
      notifLog('Failed to remove listeners:', error);
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
   * Send a test notification 5 seconds in the future.
   * Used to verify notifications work on the device.
   */
  async sendTestNotification(): Promise<boolean> {
    if (!this.isNative) {
      notifLog('Web platform - cannot send test notification');
      return false;
    }

    const permission = await this.checkPermission();
    if (permission.display !== 'granted') {
      notifLog('Test notification: permission not granted');
      return false;
    }

    try {
      const scheduleDate = new Date();
      scheduleDate.setSeconds(scheduleDate.getSeconds() + 5);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99998,
            title: '✅ Notifications are working!',
            body: 'If you see this, your notifications are set up correctly.',
            schedule: { at: scheduleDate },
            sound: 'default',
            extra: { type: 'test' },
          },
        ],
      });
      notifLog('Test notification scheduled for 5 seconds from now');
      return true;
    } catch (error) {
      notifLog('FAILED to schedule test notification:', error);
      return false;
    }
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

    const permission = await this.checkPermission();
    if (permission.display !== 'granted') {
      notifLog('Welcome notification: permission not granted');
      return;
    }

    try {
      const scheduleDate = new Date();
      scheduleDate.setSeconds(scheduleDate.getSeconds() + 5);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99999,
            title: '🎉 Congrats on your new ink!',
            body: "We're excited to be part of your healing journey. We'll be with you every step of the way!",
            schedule: { at: scheduleDate },
            sound: 'default',
            extra: { type: 'welcome' },
          },
        ],
      });
      notifLog('Welcome notification scheduled');
    } catch (error) {
      notifLog('Failed to schedule welcome notification:', error);
    }
  }

  /**
   * Schedule a long-term care reminder (sun protection / moisturize).
   * Fires once weekly for healed tattoos.
   */
  async scheduleLongTermCareReminder(): Promise<void> {
    if (!this.isNative) return;

    const permission = await this.checkPermission();
    if (permission.display !== 'granted') return;

    try {
      // Schedule for 3 days from now at 10am
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + 3);
      scheduleDate.setHours(10, 0, 0, 0);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 90000,
            title: '☀️ Protect Your Ink',
            body: 'Apply SPF 30+ to your healed tattoos before heading out. UV fading is the #1 enemy of vibrant ink!',
            schedule: { at: scheduleDate },
            sound: 'default',
            extra: { type: 'longterm_care' },
          },
        ],
      });
      notifLog('Long-term care reminder scheduled');
    } catch (error) {
      notifLog('Failed to schedule long-term care reminder:', error);
    }
  }

  /**
   * Schedule a milestone/anniversary notification for a specific date.
   */
  async scheduleMilestoneReminder(
    tattooLocation: string,
    milestoneLabel: string,
    milestoneDate: Date
  ): Promise<void> {
    if (!this.isNative) return;

    const permission = await this.checkPermission();
    if (permission.display !== 'granted') return;

    // Schedule for 9am on the milestone day
    const scheduleDate = new Date(milestoneDate);
    scheduleDate.setHours(9, 0, 0, 0);

    // Don't schedule if in the past
    if (scheduleDate <= new Date()) return;

    try {
      // Generate a unique ID from the date
      const notifId = 80000 + Math.floor(scheduleDate.getTime() / 100000) % 9999;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: `🎂 ${milestoneLabel} Ink-iversary!`,
            body: `Your ${tattooLocation} tattoo hits ${milestoneLabel} today! Take a photo to compare.`,
            schedule: { at: scheduleDate },
            sound: 'default',
            extra: { type: 'milestone' },
          },
        ],
      });
      notifLog(`Milestone reminder scheduled for ${milestoneLabel} on ${scheduleDate}`);
    } catch (error) {
      notifLog('Failed to schedule milestone reminder:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
