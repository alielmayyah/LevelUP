import { formatNumber, formatSigned } from '../../i18n/format';

export interface NumProps {
  value: number | null | undefined;
  /** Already translated, e.g. t('units.kg'). "%" sits right after the number. */
  unit?: string;
  /** Fixed decimals; without it, up to one decimal. */
  digits?: number;
  /** Show a + or − sign (a change). */
  signed?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Every standalone number (ui-standards → Type): Alexandria with tabular
 * figures, Latin digits in both languages, sign and unit kept together in a
 * <bdi> so Arabic never reorders them. A number inside a sentence stays in
 * the sentence's font instead.
 */
export function Num({ value, unit, digits, signed = false, className, testId }: NumProps) {
  let text: string;
  if (signed) {
    text = formatSigned(value, unit, { digits });
  } else {
    const n = formatNumber(value, digits);
    text = !unit || value === null || value === undefined ? n : unit === '%' ? `${n}%` : `${n} ${unit}`;
  }
  return (
    <bdi className={`font-num tabular-nums ${className ?? ''}`} data-testid={testId}>
      {text}
    </bdi>
  );
}

export default Num;
