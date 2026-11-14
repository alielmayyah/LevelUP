/*
 * Mock copies of the API's domain rules (core plan Tasks 3, 4, 8), so the mock
 * answers with the same numbers the real API will. Month boundaries use UTC,
 * which is the API's default GYM_TZ.
 */
import type { AssessmentDto, FitScoreTier, GoalMetric, Sex } from '../types';

export const round1 = (n: number): number => Math.round(n * 10) / 10;

/*
 * FitScore, the InBody Score method (InBody's own description; the exact
 * formula is proprietary):
 *   - start at 80;
 *   - standard weight = 22 × height² (men) or 21.5 × height² (women), in m;
 *   - of that, the ideal fat share is 15% (men) or 23% (women), the rest lean;
 *   - +1 point per kg of lean mass above standard, −1 per kg below;
 *   - −1 point per kg of fat above standard. Fat below standard adds nothing.
 * Checked against two real InBody sheets:
 *   - 180 cm man, 78.4 kg, 8.7 kg fat: 80 + (69.7 − 60.59) = 89.1, printed 89
 *     (crediting his 2 kg of fat below standard too would give 91);
 *   - Fat Control −10.0 kg, Muscle Control +3.8 kg: 80 − 10.0 − 3.8 = 66.2, printed 66.
 * Sources: lbwebfaq.inbodyusa.com "How is InBody Score calculated" and
 * InBody's professional result-sheet guide.
 */
const STANDARD_BMI: Record<Sex, number> = { MALE: 22, FEMALE: 21.5 };
const IDEAL_FAT_SHARE: Record<Sex, number> = { MALE: 0.15, FEMALE: 0.23 };

export interface FitScoreInput {
  weightKg: number;
  bodyFatKg: number;
  heightCm: number;
  sex: Sex;
}

function standards(heightCm: number, sex: Sex) {
  const m = heightCm / 100;
  const weight = STANDARD_BMI[sex] * m * m;
  const fat = weight * IDEAL_FAT_SHARE[sex];
  return { fat, lean: weight - fat };
}

/** 0–100, rounded. Newer InBody models allow scores above 100; FitScore caps there. */
export function computeFitScore({ weightKg, bodyFatKg, heightCm, sex }: FitScoreInput): number {
  const std = standards(heightCm, sex);
  const lean = weightKg - bodyFatKg;
  const score = 80 + (lean - std.lean) - Math.max(0, bodyFatKg - std.fat);
  return Math.min(100, Math.max(0, Math.round(score)));
}

/** The body-fat % that gives `score` at this weight and height (for building mock members). */
export function bodyFatPctForScore(score: number, weightKg: number, heightCm: number, sex: Sex): number {
  const std = standards(heightCm, sex);
  // Fat above standard: score = 80 + (W − F − stdLean) − (F − stdFat)  →  F = (80 + W − stdLean + stdFat − score) / 2
  const above = (80 + weightKg - std.lean + std.fat - score) / 2;
  // Fat at or below standard costs nothing: score = 80 + (W − F − stdLean)  →  F = 80 + W − stdLean − score
  const fatKg = above >= std.fat ? above : 80 + weightKg - std.lean - score;
  return round1((Math.max(fatKg, 0) / weightKg) * 100);
}

/** Tiers follow InBody's score bands: 80+ excellent, 70–79 good, 60–69 average, 50–59 below average, under 50. */
export function fitScoreTier(score: number): FitScoreTier {
  if (score >= 80) return 'Elite';
  if (score >= 70) return 'Strong';
  if (score >= 60) return 'On Track';
  if (score >= 50) return 'Building';
  return 'Needs Improvement';
}

export interface MonthRange {
  start: Date;
  /** Exclusive. */
  end: Date;
}

export function monthRange(at: Date): MonthRange {
  return {
    start: new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1)),
    end: new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1)),
  };
}

export interface Sample {
  takenAt: Date;
  value: number;
}

/**
 * Latest value inside the month minus a baseline: the latest value before the
 * month, or else the first value inside it. null with no scan in the month or
 * only one scan in total.
 */
export function monthDelta(samples: Sample[], range: MonthRange): number | null {
  const sorted = [...samples].sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime());
  const inside = sorted.filter((s) => s.takenAt >= range.start && s.takenAt < range.end);
  if (inside.length === 0 || sorted.length < 2) return null;
  const before = sorted.filter((s) => s.takenAt < range.start);
  const baseline = before.length ? before[before.length - 1] : inside[0];
  return inside[inside.length - 1].value - baseline.value;
}

export interface GoalProgress {
  percent: number;
  doneKg: number;
  remainingKg: number;
  estimatedCompletion: Date | null;
  reached: boolean;
}

export function goalProgress(
  goal: { startValue: number; targetValue: number; startDate: Date },
  current: number,
  now: Date,
): GoalProgress {
  const total = Math.abs(goal.targetValue - goal.startValue);
  const direction = Math.sign(goal.targetValue - goal.startValue) || 1;
  const done = (current - goal.startValue) * direction;
  const reached = total === 0 || done >= total;
  const doneKg = round1(Math.min(Math.max(done, 0), total));
  const percent = total === 0 ? 100 : Math.round(Math.min(Math.max(done / total, 0), 1) * 100);
  const elapsed = now.getTime() - goal.startDate.getTime();
  const estimatedCompletion =
    done <= 0 || elapsed <= 0 ? null : reached ? now : new Date(now.getTime() + ((total - done) / done) * elapsed);
  return { percent, doneKg, remainingKg: round1(total - doneKg), estimatedCompletion, reached };
}

export function metricValue(a: AssessmentDto, metric: GoalMetric): number {
  switch (metric) {
    case 'BODY_FAT_KG':
      return a.bodyFatKg;
    case 'MUSCLE_KG':
      return a.skeletalMuscleKg;
    case 'WEIGHT_KG':
      return a.weightKg;
  }
}
