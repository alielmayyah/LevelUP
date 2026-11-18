/**
 * "What it means": reads the change in muscle and fat between two scans and
 * names it in plain words, with one next step. Scales report small swings from
 * water and food, so changes under the thresholds count as "about the same".
 */

/** Smallest muscle change (kg) that counts as real. */
export const MUSCLE_MIN_KG = 0.2;
/** Smallest fat-mass change (kg) that counts as real. */
export const FAT_MIN_KG = 0.3;

export type InsightKind = 'recomp' | 'leanGain' | 'fatLoss' | 'bulk' | 'cutting' | 'fatGain' | 'muscleLoss' | 'steady';

/** How the news reads: good, neither, or worth a look. */
export type InsightTone = 'good' | 'neutral' | 'watch';

export interface Insight {
  kind: InsightKind;
  tone: InsightTone;
  /** Muscle change in kg, rounded to 0.1. */
  muscleKg: number;
  /** Fat-mass change in kg, rounded to 0.1. */
  fatKg: number;
}

interface Reading {
  skeletalMuscleKg: number;
  bodyFatKg: number;
}

const TONE: Record<InsightKind, InsightTone> = {
  recomp: 'good',
  leanGain: 'good',
  fatLoss: 'good',
  bulk: 'neutral',
  cutting: 'neutral',
  steady: 'neutral',
  fatGain: 'watch',
  muscleLoss: 'watch',
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const way = (diff: number, min: number) => (diff >= min ? 1 : diff <= -min ? -1 : 0);

/** The change from `before` to `scan`, or null when either reading is missing. */
export function scanInsight(scan: Reading, before: Reading): Insight | null {
  const values = [scan.skeletalMuscleKg, scan.bodyFatKg, before.skeletalMuscleKg, before.bodyFatKg];
  if (!values.every(Number.isFinite)) return null;
  const muscleKg = round1(scan.skeletalMuscleKg - before.skeletalMuscleKg);
  const fatKg = round1(scan.bodyFatKg - before.bodyFatKg);
  const m = way(muscleKg, MUSCLE_MIN_KG);
  const f = way(fatKg, FAT_MIN_KG);
  const kind: InsightKind =
    m > 0
      ? f < 0
        ? 'recomp'
        : f > 0
          ? 'bulk'
          : 'leanGain'
      : m < 0
        ? f < 0
          ? 'cutting'
          : f > 0
            ? 'fatGain'
            : 'muscleLoss'
        : f < 0
          ? 'fatLoss'
          : f > 0
            ? 'fatGain'
            : 'steady';
  return { kind, tone: TONE[kind], muscleKg, fatKg };
}
