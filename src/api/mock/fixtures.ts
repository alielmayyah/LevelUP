/*
 * Builders for mock data. Every date is computed from `now` when the mock
 * server starts, so "this month", "renews soon", and goal ETAs always hold.
 */
import type { AssessmentDto, GoalMetric, NotificationDto, Sex } from '../types';
import { round1, computeFitScore } from './domain';

const DAY = 86_400_000;

export const daysFrom = (now: Date, days: number): Date => new Date(now.getTime() + days * DAY);

/** 09:00 UTC on the 15th, `monthsAgo` months before `now`'s month. */
export const midMonth = (now: Date, monthsAgo: number): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 15, 9));

/** A time earlier this month (UTC) and at or before `now`: up to 3 days ago. */
export function thisMonthScan(now: Date): Date {
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const back = Math.min(3 * DAY, (now.getTime() - monthStart) / 2);
  return new Date(now.getTime() - back);
}

/** Scan dates, oldest first, with the newest one this month. */
export const monthlyScanDates = (now: Date, count: number): Date[] =>
  Array.from({ length: count }, (_, i) => {
    const monthsAgo = count - 1 - i;
    return monthsAgo === 0 ? thisMonthScan(now) : midMonth(now, monthsAgo);
  });

export interface ScanInput {
  takenAt: Date;
  weightKg: number;
  skeletalMuscleKg: number;
  bodyFatPct: number;
  visceralFatLevel: number;
}

let nextAssessmentId = 1;
let nextNotificationId = 1;

export function resetIds(): void {
  nextAssessmentId = 1;
  nextNotificationId = 1;
}

/** Fills in the derived body-composition fields from the inputs a scale reports. */
export function assessment(s: ScanInput, heightCm: number, sex: Sex): AssessmentDto {
  const bodyFatKg = round1((s.weightKg * s.bodyFatPct) / 100);
  const leanKg = s.weightKg - bodyFatKg;
  return {
    id: nextAssessmentId++,
    takenAt: s.takenAt.toISOString(),
    weightKg: s.weightKg,
    skeletalMuscleKg: s.skeletalMuscleKg,
    bodyFatKg,
    bodyFatPct: s.bodyFatPct,
    bmi: round1(s.weightKg / (heightCm / 100) ** 2),
    visceralFatLevel: s.visceralFatLevel,
    totalBodyWaterKg: round1(leanKg * 0.73),
    proteinKg: round1(leanKg * 0.2),
    mineralsKg: round1(leanKg * 0.068),
    bmrKcal: Math.round(370 + 21.6 * leanKg + (sex === 'MALE' ? 0 : -50)),
    fitScore: computeFitScore({ weightKg: s.weightKg, bodyFatKg, heightCm, sex }),
  };
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'UPCOMING';

export interface GoalRecord {
  id: number;
  title: string;
  metric: GoalMetric;
  startValue: number;
  targetValue: number;
  startDate: Date;
  deadline: Date;
  status: GoalStatus;
  coachNote: string | null;
  completedAt: Date | null;
}

export const scanNotification = (at: Date, score: number, read: boolean): NotificationDto => ({
  id: nextNotificationId++,
  type: 'SCAN_RESULT',
  title: { key: 'notifications.scanResult.title' },
  body: { key: 'notifications.scanResult.body', params: { score } },
  createdAt: at.toISOString(),
  readAt: read ? at.toISOString() : null,
});

export const missionNotification = (at: Date, goalTitle: string, read: boolean): NotificationDto => ({
  id: nextNotificationId++,
  type: 'MISSION_COMPLETE',
  title: { key: 'notifications.missionComplete.title' },
  body: { key: 'notifications.missionComplete.body', params: { title: goalTitle } },
  createdAt: at.toISOString(),
  readAt: read ? at.toISOString() : null,
});
