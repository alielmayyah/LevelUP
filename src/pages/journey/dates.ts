import { numberLocale } from '../../i18n/format';

const DAY = 86_400_000;

/** "18 Nov" / "18 نوفمبر". */
export const formatDay = (iso: string): string =>
  new Intl.DateTimeFormat(numberLocale(), { day: 'numeric', month: 'short' }).format(new Date(iso));

/** "Nov 2026" / "نوفمبر 2026", for the ends of the road. */
export const formatMonth = (iso: string): string =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', year: 'numeric' }).format(new Date(iso));

/** "in 4 weeks", "in 3 days", "today", "2 days ago". */
export function formatFromNow(iso: string, now: Date = new Date()): string {
  const days = Math.round((new Date(iso).getTime() - now.getTime()) / DAY);
  const rtf = new Intl.RelativeTimeFormat(numberLocale(), { numeric: 'auto' });
  if (Math.abs(days) >= 14 && days % 7 === 0) return rtf.format(days / 7, 'week');
  return rtf.format(days, 'day');
}
