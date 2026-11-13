/*
 * Mock copies of the API's domain rules (core plan Tasks 3, 4, 8), so the mock
 * answers with the same numbers the real API will. Month boundaries use UTC,
 * which is the API's default GYM_TZ.
 */
import type { FitScoreTier, GoalMetric, AssessmentDto } from '../types';

export const round1 = (n: number): number => Math.round(n * 10) / 10;

export function fitScoreTier(score: number): FitScoreTier {
  if (score >= 85) return 'Elite';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'On Track';
  if (score >= 40) return 'Building';
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
