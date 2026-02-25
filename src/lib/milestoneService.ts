import { differenceInDays, differenceInMonths, differenceInYears, addMonths, addYears, format } from 'date-fns';
import type { Tattoo } from '@/types';

export interface TattooMilestone {
  label: string;
  date: Date;
  type: '1month' | '6months' | '1year' | '2years';
  emoji: string;
  message: string;
}

const MILESTONE_DEFS = [
  { months: 1, type: '1month' as const, label: '1 Month', emoji: '🎉', message: 'Your tattoo is 1 month old! Take a photo to see how it has settled.' },
  { months: 6, type: '6months' as const, label: '6 Months', emoji: '✨', message: '6 months healed! Compare your first-day photo with today.' },
  { months: 12, type: '1year' as const, label: '1 Year', emoji: '🎂', message: "Happy Ink-iversary! Your tattoo is 1 year old. Time for a fresh photo!" },
  { months: 24, type: '2years' as const, label: '2 Years', emoji: '💎', message: "2 years with this piece! Share a side-by-side of day 1 vs now." },
];

/**
 * Get upcoming milestones for a tattoo (within the next 14 days)
 */
export function getUpcomingMilestones(tattoo: Tattoo): TattooMilestone[] {
  const tattooDate = new Date(tattoo.tattooDate);
  const now = new Date();
  const upcoming: TattooMilestone[] = [];

  for (const def of MILESTONE_DEFS) {
    const milestoneDate = addMonths(tattooDate, def.months);
    const daysUntil = differenceInDays(milestoneDate, now);

    // Show if within next 14 days or if it's today
    if (daysUntil >= -1 && daysUntil <= 14) {
      upcoming.push({
        label: def.label,
        date: milestoneDate,
        type: def.type,
        emoji: def.emoji,
        message: def.message,
      });
    }
  }

  return upcoming;
}

/**
 * Get the next milestone for a tattoo (the soonest upcoming one)
 */
export function getNextMilestone(tattoo: Tattoo): TattooMilestone | null {
  const tattooDate = new Date(tattoo.tattooDate);
  const now = new Date();

  for (const def of MILESTONE_DEFS) {
    const milestoneDate = addMonths(tattooDate, def.months);
    if (milestoneDate > now) {
      return {
        label: def.label,
        date: milestoneDate,
        type: def.type,
        emoji: def.emoji,
        message: def.message,
      };
    }
  }

  return null;
}

/**
 * Get tattoo age as a human-readable string
 */
export function getTattooAge(tattooDate: string): string {
  const date = new Date(tattooDate);
  const now = new Date();
  
  const years = differenceInYears(now, date);
  const months = differenceInMonths(now, date) % 12;
  const days = differenceInDays(now, date);

  if (days < 31) return `${days} days`;
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years}y ${months}m`;
}

/**
 * Format a milestone date for display
 */
export function formatMilestoneDate(date: Date): string {
  const now = new Date();
  const daysUntil = differenceInDays(date, now);
  
  if (daysUntil <= 0) return 'Today!';
  if (daysUntil === 1) return 'Tomorrow';
  if (daysUntil <= 7) return `In ${daysUntil} days`;
  return format(date, 'MMM d');
}
