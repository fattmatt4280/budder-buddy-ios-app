import type { FrequencyPreset, ReminderTypesEnabled } from '@/types';

// Time offsets as percentages of the awake window for each frequency
const TIME_OFFSETS: Record<FrequencyPreset, number[]> = {
  '2_per_day': [0.25, 0.75],
  '3_per_day': [0.20, 0.50, 0.80],
  '4_per_day': [0.15, 0.40, 0.65, 0.90],
};

// Minimum buffer from wake/bed times in minutes
const EDGE_BUFFER_MINUTES = 10;

export interface ReminderTime {
  time: string; // HH:MM format
  type: 'wash' | 'moisturize' | 'checkin';
  label: string;
}

export interface ScheduledReminders {
  times: ReminderTime[];
  awakeWindowMinutes: number;
}

/**
 * Parse HH:MM time string to minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:MM format
 */
export function minutesToTime(minutes: number): string {
  // Handle overnight wrap
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate the awake window duration in minutes.
 * Handles overnight schedules (e.g., wake 10:00, bed 02:00 next day)
 */
export function getAwakeWindowMinutes(wakeTime: string, bedTime: string): number {
  const wakeMinutes = parseTimeToMinutes(wakeTime);
  const bedMinutes = parseTimeToMinutes(bedTime);
  
  if (bedMinutes > wakeMinutes) {
    // Normal same-day schedule
    return bedMinutes - wakeMinutes;
  } else {
    // Overnight schedule (bed is past midnight)
    return (1440 - wakeMinutes) + bedMinutes;
  }
}

/**
 * Generate reminder times based on user preferences.
 * Spreads reminders evenly across the awake window.
 */
export function generateReminderTimes(
  wakeTime: string,
  bedTime: string,
  frequencyPreset: FrequencyPreset,
  reminderTypesEnabled: ReminderTypesEnabled,
  quietHoursEnabled: boolean
): ScheduledReminders {
  const offsets = TIME_OFFSETS[frequencyPreset];
  const wakeMinutes = parseTimeToMinutes(wakeTime);
  const awakeWindowMinutes = getAwakeWindowMinutes(wakeTime, bedTime);
  
  // Calculate effective window with edge buffers
  const effectiveStart = wakeMinutes + EDGE_BUFFER_MINUTES;
  const effectiveWindow = awakeWindowMinutes - (2 * EDGE_BUFFER_MINUTES);
  
  const times: ReminderTime[] = [];
  
  // Generate times for each offset
  offsets.forEach((offset, index) => {
    const reminderMinutes = effectiveStart + Math.round(effectiveWindow * offset);
    const timeString = minutesToTime(reminderMinutes);
    
    // Alternate between wash and moisturize based on index
    // Checkin gets the middle slot if enabled
    if (index === Math.floor(offsets.length / 2) && reminderTypesEnabled.checkin) {
      times.push({
        time: timeString,
        type: 'checkin',
        label: 'Daily check-in'
      });
    } else if (index % 2 === 0 && reminderTypesEnabled.wash) {
      times.push({
        time: timeString,
        type: 'wash',
        label: 'Wash reminder'
      });
    } else if (reminderTypesEnabled.moisturize) {
      times.push({
        time: timeString,
        type: 'moisturize',
        label: 'Moisturize reminder'
      });
    }
  });
  
  return {
    times,
    awakeWindowMinutes
  };
}

/**
 * Format time for display (e.g., "9:00 AM")
 */
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get human-readable frequency label
 */
export function getFrequencyLabel(preset: FrequencyPreset): string {
  const labels: Record<FrequencyPreset, string> = {
    '2_per_day': '2x per day',
    '3_per_day': '3x per day',
    '4_per_day': '4x per day',
  };
  return labels[preset];
}

/**
 * Notification message templates
 */
export const NOTIFICATION_MESSAGES = {
  wash: {
    title: 'Wash reminder 🧼',
    body: 'Quick wash check – Keep it gentle today.',
  },
  moisturize: {
    title: 'Moisturize reminder 🧴',
    body: 'Moisturize lightly (only if dry) – Thin layer.',
  },
  checkin: {
    title: 'Daily check-in ✨',
    body: "How's it feeling today? Log a quick check-in.",
  },
};

/**
 * Calculate snooze time from now
 */
export function calculateSnoozeTime(snoozeMinutes: string): Date {
  const now = new Date();
  return new Date(now.getTime() + parseInt(snoozeMinutes) * 60 * 1000);
}

/**
 * Check if current time is within quiet hours
 */
export function isInQuietHours(
  wakeTime: string,
  bedTime: string,
  quietHoursEnabled: boolean
): boolean {
  if (!quietHoursEnabled) return false;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const wakeMinutes = parseTimeToMinutes(wakeTime);
  const bedMinutes = parseTimeToMinutes(bedTime);
  
  if (bedMinutes > wakeMinutes) {
    // Normal same-day schedule - quiet hours are before wake or after bed
    return currentMinutes < wakeMinutes || currentMinutes >= bedMinutes;
  } else {
    // Overnight schedule - quiet hours are between bed and wake
    return currentMinutes >= bedMinutes && currentMinutes < wakeMinutes;
  }
}
