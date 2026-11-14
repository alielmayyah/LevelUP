/*
 * Builders for mock data. Every date is computed from `now` when the mock
 * server starts, so "this month", "renews soon", and goal ETAs always hold.
 */
import { bodyStandards, segmentStandard } from '../../body/standards';
import {
  BODY_SEGMENTS,
  type AssessmentDto,
  type BodySegment,
  type GoalMetric,
  type NotificationDto,
  type SegmentalAnalysis,
  type Sex,
} from '../types';
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
    segments: segmental(s, bodyFatKg, heightCm, sex),
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Segment readings that follow the whole-body numbers: more muscle shows most
 * in the arms and least in the legs, and fat leaves the limbs before the trunk
 * (the same pattern as a real lean member's InBody sheet). Left and right
 * differ by up to 3%, the same way on every scan of a member (keyed on height),
 * so changes between scans follow the whole-body trend.
 */
function segmental(s: ScanInput, fatKg: number, heightCm: number, sex: Sex): SegmentalAnalysis {
  const std = bodyStandards(heightCm, sex);
  const muscle = s.skeletalMuscleKg / std.smmKg;
  const fat = Math.max(fatKg, 0.1) / std.fatKg;
  const tilt = (((Math.round(heightCm) * 37) % 7) - 3) / 100;
  const leanPct = { arm: 100 * muscle ** 1.8, trunk: 100 * muscle ** 1.15, leg: 100 * muscle ** 0.15 };
  const fatPct = { arm: 100 * fat ** 3, trunk: 100 * fat ** 0.9, leg: 100 * fat ** 1.6 };
  const side = (seg: BodySegment) => (seg.startsWith('left') ? 1 + tilt : seg.startsWith('right') ? 1 - tilt : 1);
  const kind = (seg: BodySegment) => (seg === 'trunk' ? 'trunk' : seg.endsWith('Arm') ? 'arm' : 'leg');
  const lean = {} as SegmentalAnalysis['lean'];
  const fatOut = {} as SegmentalAnalysis['fat'];
  for (const seg of BODY_SEGMENTS) {
    const segStd = segmentStandard(std, seg);
    const lp = leanPct[kind(seg)] * side(seg);
    const fp = fatPct[kind(seg)] * side(seg);
    lean[seg] = { kg: round2((segStd.leanKg * lp) / 100), pct: round1(lp) };
    fatOut[seg] = { kg: round1((segStd.fatKg * fp) / 100), pct: round1(fp) };
  }
  return { lean, fat: fatOut };
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
  /** Set by the member in the app (POST /me/goals), not seeded; persisted in Preferences. */
  createdByMember?: boolean;
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
