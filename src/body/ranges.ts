import type { AssessmentDto, NormalRange, RangedKey, Sex } from '../api/types';
import { bodyStandards, SCALES, statusFor, type Status } from './standards';

export type ReportKey = 'weightKg' | 'skeletalMuscleKg' | 'bodyFatKg' | 'bodyFatPct' | 'totalBodyWaterKg';

export interface ResolvedRange extends NormalRange {
  /** Where the band came from: the machine's printed sheet, or src/body/standards.ts for the member's height. */
  source: 'machine' | 'standard';
}

/**
 * The normal band for one metric on one scan (docs/redesign/PLAN.md,
 * decision 13): the machine's printed range when the scan carries one,
 * otherwise the standard for the member's height and sex.
 */
export function rangeFor(scan: AssessmentDto, key: ReportKey, sex: Sex, heightCm: number): ResolvedRange {
  const printed = scan.ranges?.[key as RangedKey];
  if (printed) return { ...printed, source: 'machine' };
  const std = bodyStandards(scan.extra?.heightCm ?? heightCm, sex);
  const pct = (base: number, [lo, hi]: readonly [number, number]) => ({
    low: (base * lo) / 100,
    high: (base * hi) / 100,
  });
  const band = {
    weightKg: pct(std.weightKg, SCALES.weight.normal),
    skeletalMuscleKg: pct(std.smmKg, SCALES.smm.normal),
    bodyFatKg: pct(std.fatKg, SCALES.fat.normal),
    bodyFatPct: {
      low: (sex === 'MALE' ? SCALES.pbfMale : SCALES.pbfFemale).normal[0],
      high: (sex === 'MALE' ? SCALES.pbfMale : SCALES.pbfFemale).normal[1],
    },
    totalBodyWaterKg: pct(std.waterKg, [90, 110]),
  }[key];
  return { ...band, source: 'standard' };
}

export const zoneOf = (value: number, r: NormalRange): Status => statusFor(value, [r.low, r.high]);

/** Which side of the band needs attention for each metric (null: neither side is a worry on its own). */
export const ATTENTION_SIDE: Record<ReportKey, Status | null> = {
  weightKg: null,
  skeletalMuscleKg: 'under',
  bodyFatKg: 'over',
  bodyFatPct: 'over',
  totalBodyWaterKg: 'under',
};

/** Where a value sits on its track, 0 to 1, with the band in the middle half. */
export function trackPosition(value: number, r: NormalRange): number {
  const span = Math.max(r.high - r.low, 1e-6);
  const min = r.low - span / 2;
  const max = r.high + span / 2;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}
