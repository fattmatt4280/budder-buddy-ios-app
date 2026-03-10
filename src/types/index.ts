// Budder Buddy - TypeScript Types

export type SizeTier = 'Small' | 'Medium' | 'Large';
export type InkType = 'BlackGrey' | 'Color';

export interface Tattoo {
  id: string;
  createdAt: string;
  name?: string; // User-given title e.g. "Spiderweb", "Rose"
  tattooDate: string; // ISO date string (YYYY-MM-DD)
  bodyLocation: string;
  sizeTier: SizeTier;
  inkType: InkType;
  artistName?: string;
  shopName?: string;
  notes?: string;
  artistSocialLink?: string;
  // Manual healing control
  isHealed?: boolean;
  healedDate?: string; // ISO date when marked healed
}

export interface DailyChecklist {
  washed: boolean;
  moisturized: boolean;
  avoidedSun: boolean;
  didNotScratch: boolean;
  drankWater: boolean;
}

export interface DailyCheckin {
  id: string;
  tattooId: string;
  dayNumber: number;
  date: string; // ISO date string
  checklist: DailyChecklist;
  userNotes?: string;
  observations?: string[]; // Array of symptom tags from user observations
}

export interface PhotoEntry {
  id: string;
  tattooId: string;
  dayNumber: number;
  date: string; // ISO date string
  imageData: string; // Base64 encoded image data for local storage
  caption?: string;
}

export type FrequencyPreset = '2_per_day' | '3_per_day' | '4_per_day';
export type SnoozeDuration = '30' | '60' | '120';

export interface ReminderTypesEnabled {
  wash: boolean;
  moisturize: boolean;
  checkin: boolean;
}

export interface NotificationSchedule {
  morningTime: string; // HH:MM format (legacy)
  eveningTime: string; // HH:MM format (legacy)
  frequencyPreset: FrequencyPreset;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  notifSchedule: NotificationSchedule;
  // New Smart Reminders settings
  quietHoursEnabled: boolean;
  wakeTime: string; // HH:MM format
  bedTime: string; // HH:MM format
  reminderTypesEnabled: ReminderTypesEnabled;
  snoozeMinutes: SnoozeDuration;
  pausedUntil: string | null; // ISO date string for pause feature
  // Existing settings
  cloudSyncEnabled: boolean;
  selectedTattooId: string | null;
  hasCompletedOnboarding: boolean;
  hasAcknowledgedDisclaimer: boolean;
  hasCompletedReminderSetup: boolean;
  // Post-reminder UX flags
  remindersJustSaved: boolean;
  todayStartHereDismissed: boolean;
  notificationPermissionStatus: 'granted' | 'denied' | 'default' | null;
  // Environment notifications
  sunGuardEnabled: boolean;
  activityRemindersEnabled: boolean;
  // Long-term care (post-healing)
  longTermCareEnabled: boolean;
}

export interface HealingPhase {
  name: string;
  dayRange: [number, number];
  color: string;
}

export interface DayContent {
  dayRange: [number, number];
  whatsNormal: string[];
  whatToDo: string[];
  whatToAvoid: string[];
  notificationTemplates: {
    morning: string;
    evening: string;
  };
}

export interface EducationCategory {
  id: string;
  title: string;
  icon: string;
  articles: EducationArticle[];
}

export interface EducationArticle {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  content: string[];
  escalationNote?: string;
  externalUrl?: string;
}

// Body locations
export const BODY_LOCATIONS = [
  'Forearm',
  'Upper Arm',
  'Shoulder',
  'Back',
  'Chest',
  'Ribs',
  'Stomach',
  'Hip',
  'Thigh',
  'Calf',
  'Ankle',
  'Foot',
  'Wrist',
  'Hand',
  'Neck',
  'Behind Ear',
  'Other'
] as const;

export type BodyLocation = typeof BODY_LOCATIONS[number];

// Healing phases
export const HEALING_PHASES: HealingPhase[] = [
  { name: 'Fresh', dayRange: [0, 1], color: 'phase-initial' },
  { name: 'Early Healing', dayRange: [2, 5], color: 'phase-peeling' },
  { name: 'Peeling', dayRange: [6, 14], color: 'phase-settling' },
  { name: 'Settling', dayRange: [15, 30], color: 'phase-healed' },
];

export function getHealingPhase(dayNumber: number): HealingPhase {
  for (const phase of HEALING_PHASES) {
    if (dayNumber >= phase.dayRange[0] && dayNumber <= phase.dayRange[1]) {
      return phase;
    }
  }
  return { name: 'Healed', dayRange: [31, 999], color: 'phase-healed' };
}

export function getDayNumber(tattooDate: string): number {
  const tattoo = new Date(tattooDate);
  const today = new Date();
  tattoo.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - tattoo.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getHealingProgress(dayNumber: number): number {
  return Math.min(100, Math.round((dayNumber / 30) * 100));
}
