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
  // The signed number keeps its own left-to-right isolate (so "−" stays in front); a word unit
  // sits outside it, so in Arabic the number reads first, then "كجم", like an unsigned value.
  const n = signed ? formatSigned(value, unit === '%' ? '%' : undefined, { digits }) : formatNumber(value, digits);
  const missing = value === null || value === undefined || !Number.isFinite(value);
  const text = missing || !unit ? n : unit === '%' ? (signed ? n : `${n}%`) : `${n}\u00a0${unit}`;
  return (
    <bdi className={`font-num tabular-nums ${className ?? ''}`} data-testid={testId}>
      {text}
    </bdi>
  );
}

export default Num;
