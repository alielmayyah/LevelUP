import type { FitScoreTier } from '../../api/types';
import { numberLocale } from '../../i18n/format';

export type GreetingPart = 'morning' | 'afternoon' | 'evening' | 'late';

/** 05–11 morning, 12–16 afternoon, 17–21 evening, 22–04 late, by the device clock. */
export function greetingPart(hour: number): GreetingPart {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'late';
}

const TIER_KEYS: Record<FitScoreTier, string> = {
  Elite: 'elite',
  Strong: 'strong',
  'On Track': 'onTrack',
  Building: 'building',
  'Needs Improvement': 'needsImprovement',
};

export const tierKey = (tier: FitScoreTier): string => `home.tier.${TIER_KEYS[tier]}`;

/** "Friday, 13 November" in the app's language. */
export const formatToday = (date: Date): string =>
  new Intl.DateTimeFormat(numberLocale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(date);

/** "Mar 2026". */
export const formatMonthYear = (iso: string): string =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', year: 'numeric' }).format(new Date(iso));

/** "November". */
export const formatMonth = (date: Date): string =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'long' }).format(date);

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['week', 7 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/** "2 hours ago", "yesterday", "just now". */
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const diff = new Date(iso).getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(numberLocale(), { numeric: 'auto' });
  for (const [unit, ms] of UNITS) if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  return rtf.format(0, 'minute');
}
