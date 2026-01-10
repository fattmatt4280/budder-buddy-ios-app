import type { FrequencyPreset, ReminderTypesEnabled } from '@/types';

// Time offsets as percentages of the awake window for each frequency
// 0 = wake time, 1 = bed time
// Wake and Bed are ALWAYS included as standard reminders
// The 2/3/4 selection adds EXTRA reminders in between
const TIME_OFFSETS: Record<FrequencyPreset, number[]> = {
  '2_per_day': [0, 0.33, 0.66, 1],           // Wake + 2 midday + Bed = 4 total
  '3_per_day': [0, 0.25, 0.5, 0.75, 1],      // Wake + 3 midday + Bed = 5 total
  '4_per_day': [0, 0.2, 0.4, 0.6, 0.8, 1],   // Wake + 4 midday + Bed = 6 total
};

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
  
  const times: ReminderTime[] = [];
  const isFirstOffset = (index: number) => index === 0;
  const isLastOffset = (index: number) => index === offsets.length - 1;
  
  // Generate times for each offset
  offsets.forEach((offset, index) => {
    const reminderMinutes = wakeMinutes + Math.round(awakeWindowMinutes * offset);
    const timeString = minutesToTime(reminderMinutes);
    
    // Determine label based on position
    let label: string;
    if (isFirstOffset(index)) {
      label = 'Morning care';
    } else if (isLastOffset(index)) {
      label = 'Bedtime care';
    } else if (offsets.length === 4 && index === 1) {
      label = 'Midday care';
    } else if (offsets.length === 4 && index === 2) {
      label = 'Afternoon care';
    } else {
      label = 'Midday care';
    }
    
    // Determine type based on position and enabled types
    // First and last are always moisturize (application reminders)
    // Middle slots alternate or become check-in
    if (isFirstOffset(index) || isLastOffset(index)) {
      if (reminderTypesEnabled.moisturize) {
        times.push({ time: timeString, type: 'moisturize', label });
      } else if (reminderTypesEnabled.wash) {
        times.push({ time: timeString, type: 'wash', label });
      }
    } else if (reminderTypesEnabled.checkin && index === Math.floor(offsets.length / 2)) {
      times.push({ time: timeString, type: 'checkin', label: 'Daily check-in' });
    } else if (reminderTypesEnabled.wash) {
      times.push({ time: timeString, type: 'wash', label });
    } else if (reminderTypesEnabled.moisturize) {
      times.push({ time: timeString, type: 'moisturize', label });
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
    '2_per_day': '+2/day (4 total)',
    '3_per_day': '+3/day (5 total)',
    '4_per_day': '+4/day (6 total)',
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
