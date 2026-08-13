// Shared config for the Heal Aid (heal-aid.com) redirect, referenced by every
// screen that lets a user log observations/check-ins — currently TodayScreen
// and DailyCheckinScreen. Keep these in one place; the two screens duplicate
// their own check-in UI already, so anything trigger-related belongs here
// instead of being copy-pasted per screen.

export const HEAL_AID_URL = 'https://heal-aid.com';

// Any of these observation tags present once healing is a week+ along
// triggers the redirect prompt.
export const HEAL_AID_SYMPTOM_TAGS = ['sore', 'really_sore', 'hot', 'swelling', 'redness'];
export const HEAL_AID_SYMPTOM_DAY_THRESHOLD = 7; // "after 7 days" / a week into healing

// Self-reported concern can trigger the same prompt starting this day.
export const HEAL_AID_CONCERN_DAY_THRESHOLD = 2;

export type HealAidWarningReason = 'symptoms' | 'concern';
