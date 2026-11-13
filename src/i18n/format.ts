import { currentLanguage, type Lang } from './index';

const LRI = '⁦'; // left-to-right isolate
const PDI = '⁩'; // pop directional isolate
const MINUS = '−';
const DASH = '—';

/** Latin digits in both languages, so scores and Fit IDs look the same everywhere. */
export const numberLocale = (lang: Lang = currentLanguage()): string => (lang === 'ar' ? 'ar-u-nu-latn' : 'en');

const isNumber = (n: number | null | undefined): n is number => typeof n === 'number' && Number.isFinite(n);

/** A plain number. `digits` fixes the decimals; without it, up to 1 decimal is shown. */
export function formatNumber(n: number | null | undefined, digits?: number): string {
  if (!isNumber(n)) return DASH;
  return new Intl.NumberFormat(numberLocale(), {
    minimumFractionDigits: digits ?? 0,
    maximumFractionDigits: digits ?? 1,
  }).format(n);
}

/**
 * A signed change such as `+0.8 kg` or `−1.2%`, or `—` when there is no value.
 * The result is wrapped in a left-to-right isolate so Arabic text around it
 * never reorders the sign, number, and unit.
 */
export function formatSigned(n: number | null | undefined, unit?: string, opts: { digits?: number } = {}): string {
  if (!isNumber(n)) return DASH;
  const number = new Intl.NumberFormat(numberLocale(), {
    signDisplay: 'exceptZero',
    minimumFractionDigits: opts.digits ?? 0,
    maximumFractionDigits: opts.digits ?? 1,
  })
    .format(n)
    .replace(/[-−؜‎‏]/g, (c) => (c === '-' || c === MINUS ? MINUS : ''));
  const suffix = !unit ? '' : unit === '%' ? '%' : ` ${unit}`;
  return `${LRI}${number}${suffix}${PDI}`;
}
