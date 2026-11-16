/** A span of time in the biggest whole unit that fits, for tags such as "3 days ago". */
export interface Span {
  unit: 'day' | 'week' | 'month' | 'year';
  count: number;
}

const DAY = 86_400_000;

/** Midnight of the date's local day, so a scan from late last night still counts as yesterday. */
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). */
export const daysBetween = (from: Date | string, to: Date | string): number =>
  Math.round((dayStart(new Date(to)) - dayStart(new Date(from))) / DAY);

/** Days as the biggest unit that fits: 9 days is 1 week, 45 days is 1 month. Null for 0 days. */
export function spanOf(days: number): Span | null {
  const d = Math.abs(days);
  if (d === 0) return null;
  if (d < 7) return { unit: 'day', count: d };
  if (d < 30) return { unit: 'week', count: Math.floor(d / 7) };
  if (d < 365) return { unit: 'month', count: Math.floor(d / 30) };
  return { unit: 'year', count: Math.floor(d / 365) };
}
