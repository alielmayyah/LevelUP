/*
 * Body-composition standards, the way an InBody result sheet works them out.
 * Used by the Progress screen to draw the analysis bars and by the mock API to
 * build segmental readings, so both agree on what "normal" means.
 *
 * Checked against a real InBody 120 sheet (180 cm man): standard weight
 * 22 × 1.8² = 71.3 kg, normal 60.6–82.0 kg (85–115%); body fat mass normal
 * 8.6–17.1 kg (80–160% of a 15% fat share); skeletal muscle 30.6–37.4 kg
 * (90–110% of 34.0 kg); water 40.1–49.0 L, protein 10.7–13.1 kg, minerals
 * 3.71–4.53 kg (90–110% of their share of standard lean mass).
 */
import type { BodySegment, Sex } from '../api/types';

export type Status = 'under' | 'normal' | 'over';

const STANDARD_BMI: Record<Sex, number> = { MALE: 22, FEMALE: 21.5 };
const FAT_SHARE: Record<Sex, number> = { MALE: 0.15, FEMALE: 0.23 };
/** Skeletal muscle as a share of standard lean mass. */
const SMM_SHARE: Record<Sex, number> = { MALE: 0.561, FEMALE: 0.53 };
/** Water, protein, and minerals as shares of standard lean mass. */
const LEAN_SHARE = { water: 0.735, protein: 0.196, minerals: 0.068 } as const;

export interface BodyStandards {
  weightKg: number;
  fatKg: number;
  leanKg: number;
  smmKg: number;
  waterKg: number;
  proteinKg: number;
  mineralsKg: number;
}

export function bodyStandards(heightCm: number, sex: Sex): BodyStandards {
  const m = heightCm / 100;
  const weightKg = STANDARD_BMI[sex] * m * m;
  const fatKg = weightKg * FAT_SHARE[sex];
  const leanKg = weightKg - fatKg;
  return {
    weightKg,
    fatKg,
    leanKg,
    smmKg: leanKg * SMM_SHARE[sex],
    waterKg: leanKg * LEAN_SHARE.water,
    proteinKg: leanKg * LEAN_SHARE.protein,
    mineralsKg: leanKg * LEAN_SHARE.minerals,
  };
}

/** A bar's printed tick marks (evenly spaced, so the scale can be uneven) and its normal band. */
export interface Scale {
  ticks: readonly number[];
  normal: readonly [number, number];
}

/** The scales from the InBody sheet. Weight, muscle, and fat are % of standard. */
export const SCALES = {
  weight: { ticks: [55, 70, 85, 100, 115, 130, 145, 160, 175, 190, 205], normal: [85, 115] },
  smm: { ticks: [70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170], normal: [90, 110] },
  fat: { ticks: [40, 60, 80, 100, 160, 220, 280, 340, 400, 460, 520], normal: [80, 160] },
  bmi: { ticks: [10, 15, 18.5, 22, 25, 30, 35, 40, 45, 50, 55], normal: [18.5, 25] },
  pbfMale: { ticks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50], normal: [10, 20] },
  pbfFemale: { ticks: [8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58], normal: [18, 28] },
  /** Segments: lean is % of the standard for that limb; fat likewise. */
  segmentLean: { ticks: [40, 60, 80, 100, 120, 140, 160], normal: [90, 110] },
  segmentFat: { ticks: [0, 50, 100, 150, 200, 250, 300], normal: [80, 160] },
} as const satisfies Record<string, Scale>;

/** Where `value` sits along the bar, 0 to 1, reading the ticks piece by piece. Clamped at both ends. */
export function scalePosition(scale: Scale, value: number): number {
  const { ticks } = scale;
  const last = ticks.length - 1;
  if (!Number.isFinite(value) || value <= ticks[0]) return 0;
  if (value >= ticks[last]) return 1;
  let i = 0;
  while (value > ticks[i + 1]) i++;
  return (i + (value - ticks[i]) / (ticks[i + 1] - ticks[i])) / last;
}

/** Under, normal, or over a [low, high] band. The bounds count as normal. */
export function statusFor(value: number, [low, high]: readonly [number, number]): Status {
  if (value < low) return 'under';
  if (value > high) return 'over';
  return 'normal';
}

/** A normal band in kg: 90–110% of the standard unless the scale says otherwise. */
export const kgRange = (standardKg: number, [low, high]: readonly [number, number] = [90, 110]): [number, number] => [
  (standardKg * low) / 100,
  (standardKg * high) / 100,
];

/** Each segment's share of standard lean and fat mass (from the InBody sheet's own standards). */
const SEGMENT_LEAN_SHARE: Record<'arm' | 'trunk' | 'leg', number> = { arm: 0.0548, trunk: 0.454, leg: 0.166 };
const SEGMENT_FAT_SHARE: Record<'arm' | 'trunk' | 'leg', number> = { arm: 0.054, trunk: 0.424, leg: 0.171 };

const part = (s: BodySegment): 'arm' | 'trunk' | 'leg' =>
  s === 'trunk' ? 'trunk' : s === 'leftArm' || s === 'rightArm' ? 'arm' : 'leg';

/** The standard lean and fat mass for one segment, in kg. */
export function segmentStandard(std: BodyStandards, segment: BodySegment): { leanKg: number; fatKg: number } {
  const p = part(segment);
  return { leanKg: std.leanKg * SEGMENT_LEAN_SHARE[p], fatKg: std.fatKg * SEGMENT_FAT_SHARE[p] };
}
