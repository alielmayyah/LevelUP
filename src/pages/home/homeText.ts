import { numberLocale } from '../../i18n/format';

/** "Friday, 13 November" in the app's language. */
export const formatToday = (date: Date): string =>
  new Intl.DateTimeFormat(numberLocale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(date);

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
