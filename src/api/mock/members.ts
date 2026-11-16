/*
 * Mock members. See README.md in this folder for what each one is for.
 *
 *   101 Mohamed Omran  full history, #1 on every men's board, coach assigned
 *   102 Lina Haddad  new member: no scans, no goals, opted out
 *   103 Omar Aziz    one scan, FitScore hidden, membership ends in 10 days
 *   104–139       36 opted-in fillers (18 men, 18 women) so both leaderboards have rows
 *   140 Sara Adel    new member: no scans, no goals, but joined the leaderboard
 */
import type { AssessmentDto, LiftRecordDto, NotificationDto, SettingsDto, Sex } from '../types';
import { bodyFatPctForScore } from './domain';
import {
  assessment,
  daysFrom,
  type GoalRecord,
  midMonth,
  missionNotification,
  monthlyScanDates,
  resetIds,
  scanNotification,
  thisMonthScan,
} from './fixtures';

export interface MockMember {
  id: number;
  fitId: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate: Date;
  heightCm: number;
  membershipPlan: string;
  membershipStart: Date;
  membershipEnd: Date;
  coach: string | null;
  settings: SettingsDto;
  /** Oldest first. */
  assessments: AssessmentDto[];
  goals: GoalRecord[];
  notifications: NotificationDto[];
  /** Oldest first. Lifts a coach recorded on the gym floor. */
  lifts: LiftRecordDto[];
}

function mohamed(now: Date): MockMember {
  const heightCm = 183;
  const dates = monthlyScanDates(now, 6);
  // Six months of a lean bulk: muscle up 4.9 kg while body fat falls to 8%.
  const series = [
    { weightKg: 76.2, bodyFatPct: 14.6, skeletalMuscleKg: 36.4, visceralFatLevel: 5 },
    { weightKg: 77.0, bodyFatPct: 13.1, skeletalMuscleKg: 37.3, visceralFatLevel: 5 },
    { weightKg: 77.8, bodyFatPct: 11.8, skeletalMuscleKg: 38.4, visceralFatLevel: 4 },
    { weightKg: 78.6, bodyFatPct: 10.4, skeletalMuscleKg: 39.3, visceralFatLevel: 4 },
    { weightKg: 79.3, bodyFatPct: 9.1, skeletalMuscleKg: 40.4, visceralFatLevel: 3 },
    { weightKg: 80.0, bodyFatPct: 8.0, skeletalMuscleKg: 41.3, visceralFatLevel: 3 },
  ];
  const assessments = series.map((s, i) => assessment({ ...s, takenAt: dates[i] }, heightCm, 'MALE'));
  return {
    id: 1,
    fitId: '101',
    firstName: 'Mohamed',
    lastName: 'Omran',
    sex: 'MALE',
    birthDate: new Date('2003-05-20T00:00:00Z'),
    heightCm,
    membershipPlan: 'Premium · 12 months',
    membershipStart: midMonth(now, 8),
    membershipEnd: daysFrom(now, 120),
    coach: 'Rami Saad',
    settings: { showFitScore: true, fitScoreOnLeaderboard: true },
    assessments,
    lifts: mohamedLifts(dates),
    goals: [
      {
        id: 1,
        title: 'Gain 3 kg of muscle',
        metric: 'MUSCLE_KG',
        startValue: 39.3,
        targetValue: 42.3,
        startDate: dates[3],
        deadline: daysFrom(now, 60),
        status: 'ACTIVE',
        coachNote: 'Keep protein high on training days.',
        completedAt: null,
      },
      {
        id: 2,
        title: 'Lose 3 kg of body fat',
        metric: 'BODY_FAT_KG',
        startValue: 11.1,
        targetValue: 8.1,
        startDate: dates[0],
        deadline: dates[4],
        status: 'COMPLETED',
        coachNote: null,
        completedAt: dates[3],
      },
      {
        id: 3,
        title: 'Gain 2 kg of muscle',
        metric: 'MUSCLE_KG',
        startValue: 36.4,
        targetValue: 38.4,
        startDate: dates[0],
        deadline: dates[3],
        status: 'COMPLETED',
        coachNote: 'Great consistency.',
        completedAt: dates[2],
      },
      {
        id: 4,
        title: 'Reach 82 kg',
        metric: 'WEIGHT_KG',
        startValue: 80.0,
        targetValue: 82.0,
        startDate: daysFrom(now, -3),
        deadline: null,
        status: 'ACTIVE',
        coachNote: null,
        completedAt: null,
      },
    ],
    notifications: [
      scanNotification(dates[2], assessments[2].fitScore, true),
      missionNotification(dates[3], 'Lose 3 kg of body fat', true),
      scanNotification(dates[4], assessments[4].fitScore, false),
      scanNotification(dates[5], assessments[5].fitScore, false),
    ],
  };
}

/**
 * Mohamed's verified bench and squat progression, plus a working set (counted
 * separately from one-rep maxes) and a lift still waiting for his coach to verify.
 */
function mohamedLifts(dates: Date[]): LiftRecordDto[] {
  const lift = (
    id: number,
    exercise: LiftRecordDto['exercise'],
    measurement: LiftRecordDto['measurement'],
    weightKg: number,
    reps: number,
    at: Date,
    verified = true,
  ): LiftRecordDto => ({ id, exercise, measurement, weightKg, reps, recordedAt: at.toISOString(), verified });
  return [
    lift(1, 'BENCH_PRESS', 'ONE_REP_MAX', 60, 1, dates[1]),
    lift(2, 'SQUAT', 'ONE_REP_MAX', 85, 1, dates[1]),
    lift(3, 'BENCH_PRESS', 'ONE_REP_MAX', 72.5, 1, dates[3]),
    lift(4, 'SQUAT', 'ONE_REP_MAX', 100, 1, dates[3]),
    lift(5, 'BENCH_PRESS', 'WORKING_SET', 70, 5, dates[4]),
    lift(6, 'BENCH_PRESS', 'ONE_REP_MAX', 82.5, 1, dates[5]),
    lift(7, 'SQUAT', 'ONE_REP_MAX', 110, 1, dates[5]),
    lift(8, 'SQUAT', 'ONE_REP_MAX', 130, 1, dates[5], false),
    lift(9, 'DEADLIFT', 'ONE_REP_MAX', 125, 1, dates[5]),
    lift(10, 'MILITARY_PRESS', 'ONE_REP_MAX', 35, 1, dates[5]),
    lift(11, 'PUSH_UP', 'CONSECUTIVE_REPS', 0, 32, dates[5]),
    lift(12, 'PULL_UP', 'CONSECUTIVE_REPS', 0, 8, dates[5]),
    { ...lift(13, 'PLANK', 'DURATION', 0, 0, dates[5]), durationSeconds: 120 },
  ];
}

function lina(now: Date): MockMember {
  return {
    id: 2,
    fitId: '102',
    firstName: 'Lina',
    lastName: 'Haddad',
    sex: 'FEMALE',
    birthDate: new Date('1999-07-24T00:00:00Z'),
    heightCm: 164,
    membershipPlan: 'Standard · 12 months',
    membershipStart: daysFrom(now, -3),
    membershipEnd: daysFrom(now, 362),
    coach: null,
    settings: { showFitScore: true, fitScoreOnLeaderboard: false },
    assessments: [],
    goals: [],
    notifications: [],
    lifts: [],
  };
}

/** A second brand-new member: like Lina, but she joined the leaderboard before her first scan. */
function sara(now: Date): MockMember {
  return {
    id: 40,
    fitId: '140',
    firstName: 'Sara',
    lastName: 'Adel',
    sex: 'FEMALE',
    birthDate: new Date('2001-02-09T00:00:00Z'),
    heightCm: 168,
    membershipPlan: 'Standard · 6 months',
    membershipStart: daysFrom(now, -1),
    membershipEnd: daysFrom(now, 181),
    coach: null,
    settings: { showFitScore: true, fitScoreOnLeaderboard: true },
    assessments: [],
    goals: [],
    notifications: [],
    lifts: [],
  };
}

function omar(now: Date): MockMember {
  const heightCm = 182;
  const takenAt = thisMonthScan(now);
  const scan = assessment(
    { takenAt, weightKg: 91.4, bodyFatPct: 27.8, skeletalMuscleKg: 36.2, visceralFatLevel: 12 },
    heightCm,
    'MALE',
  );
  return {
    id: 3,
    fitId: '103',
    firstName: 'Omar',
    lastName: 'Aziz',
    sex: 'MALE',
    birthDate: new Date('1988-11-02T00:00:00Z'),
    heightCm,
    membershipPlan: 'Standard · 3 months',
    membershipStart: daysFrom(now, -80),
    membershipEnd: daysFrom(now, 10),
    coach: 'Rami Saad',
    settings: { showFitScore: false, fitScoreOnLeaderboard: false },
    assessments: [scan],
    goals: [],
    notifications: [scanNotification(takenAt, scan.fitScore, false)],
    lifts: [],
  };
}

const FILLERS: { first: string; last: string; sex: Sex; score: number; scannedThisMonth: boolean }[] = [
  { first: 'Nour', last: 'Saleh', sex: 'FEMALE', score: 88, scannedThisMonth: true },
  { first: 'Karim', last: 'Mansour', sex: 'MALE', score: 81, scannedThisMonth: true },
  { first: 'Yara', last: 'Fares', sex: 'FEMALE', score: 76, scannedThisMonth: true },
  { first: 'Hadi', last: 'Nasser', sex: 'MALE', score: 70, scannedThisMonth: true },
  { first: 'Rania', last: 'Toma', sex: 'FEMALE', score: 68, scannedThisMonth: true },
  { first: 'Ziad', last: 'Barakat', sex: 'MALE', score: 65, scannedThisMonth: true },
  { first: 'Maya', last: 'Khoury', sex: 'FEMALE', score: 63, scannedThisMonth: true },
  { first: 'Tarek', last: 'Aoun', sex: 'MALE', score: 60, scannedThisMonth: true },
  { first: 'Dina', last: 'Sabbagh', sex: 'FEMALE', score: 57, scannedThisMonth: false },
  { first: 'Fadi', last: 'Azar', sex: 'MALE', score: 54, scannedThisMonth: false },
  { first: 'Lara', last: 'Mikhael', sex: 'FEMALE', score: 49, scannedThisMonth: false },
  { first: 'Sami', last: 'Daher', sex: 'MALE', score: 44, scannedThisMonth: false },
  // 24 more, so both divisions have enough people to fill the podium and a second page.
  { first: 'Youssef', last: 'Hamdy', sex: 'MALE', score: 90, scannedThisMonth: true },
  { first: 'Salma', last: 'Hussein', sex: 'FEMALE', score: 92, scannedThisMonth: true },
  { first: 'Mostafa', last: 'Adel', sex: 'MALE', score: 86, scannedThisMonth: true },
  { first: 'Habiba', last: 'Mourad', sex: 'FEMALE', score: 84, scannedThisMonth: true },
  { first: 'Ahmed', last: 'Fathy', sex: 'MALE', score: 78, scannedThisMonth: false },
  { first: 'Farida', last: 'Zaki', sex: 'FEMALE', score: 79, scannedThisMonth: false },
  { first: 'Mahmoud', last: 'Saeed', sex: 'MALE', score: 75, scannedThisMonth: true },
  { first: 'Mariam', last: 'Sobhy', sex: 'FEMALE', score: 74, scannedThisMonth: true },
  { first: 'Khaled', last: 'Ibrahim', sex: 'MALE', score: 69, scannedThisMonth: true },
  { first: 'Jana', last: 'Ashraf', sex: 'FEMALE', score: 71, scannedThisMonth: true },
  { first: 'Amr', last: 'Nabil', sex: 'MALE', score: 67, scannedThisMonth: false },
  { first: 'Laila', last: 'Shawky', sex: 'FEMALE', score: 66, scannedThisMonth: false },
  { first: 'Hassan', last: 'Farouk', sex: 'MALE', score: 62, scannedThisMonth: true },
  { first: 'Hana', last: 'Gamal', sex: 'FEMALE', score: 61, scannedThisMonth: true },
  { first: 'Mohamed', last: 'Tawfik', sex: 'MALE', score: 58, scannedThisMonth: true },
  { first: 'Rana', last: 'Fouad', sex: 'FEMALE', score: 56, scannedThisMonth: true },
  { first: 'Ali', last: 'Ragab', sex: 'MALE', score: 52, scannedThisMonth: false },
  { first: 'Nada', last: 'Essam', sex: 'FEMALE', score: 53, scannedThisMonth: false },
  { first: 'Islam', last: 'Samir', sex: 'MALE', score: 48, scannedThisMonth: true },
  { first: 'Aya', last: 'Mamdouh', sex: 'FEMALE', score: 47, scannedThisMonth: true },
  { first: 'Sherif', last: 'Lotfy', sex: 'MALE', score: 41, scannedThisMonth: true },
  { first: 'Malak', last: 'Tamer', sex: 'FEMALE', score: 43, scannedThisMonth: true },
  { first: 'Wael', last: 'Kamal', sex: 'MALE', score: 38, scannedThisMonth: false },
  { first: 'Reem', last: 'Helmy', sex: 'FEMALE', score: 39, scannedThisMonth: false },
];

function filler(now: Date, i: number): MockMember {
  const f = FILLERS[i];
  const heightCm = f.sex === 'MALE' ? 176 + (i % 5) : 162 + (i % 5);
  const baseWeight = (f.sex === 'MALE' ? 80 : 63) + (i % 4) * 2;
  const baseMuscle = (f.sex === 'MALE' ? 35 : 26) + (f.score - 60) / 20;
  // Two scans: last month + this month, or two and one months ago.
  const dates = f.scannedThisMonth ? [midMonth(now, 1), thisMonthScan(now)] : [midMonth(now, 2), midMonth(now, 1)];
  // Varied monthly changes so the monthly boards differ from Top Score.
  const muscleGain = 0.2 + ((i * 3) % 8) / 10;
  const scoreGain = 1 + ((i * 5) % 6);
  // Body fat is chosen so the InBody method gives the intended score (FitScore is computed, not set).
  const scans = [
    {
      weightKg: baseWeight + 0.8,
      bodyFatPct: bodyFatPctForScore(f.score - scoreGain, baseWeight + 0.8, heightCm, f.sex),
      skeletalMuscleKg: round(baseMuscle - muscleGain),
    },
    {
      weightKg: baseWeight,
      bodyFatPct: bodyFatPctForScore(f.score, baseWeight, heightCm, f.sex),
      skeletalMuscleKg: round(baseMuscle),
    },
  ];
  return {
    id: 4 + i,
    fitId: String(104 + i),
    firstName: f.first,
    lastName: f.last,
    sex: f.sex,
    birthDate: new Date(Date.UTC(1976 + (i % 29), i % 12, 10)),
    heightCm,
    membershipPlan: 'Standard · 12 months',
    membershipStart: midMonth(now, 6),
    membershipEnd: daysFrom(now, 180),
    coach: null,
    settings: { showFitScore: true, fitScoreOnLeaderboard: true },
    assessments: scans.map((s, k) =>
      assessment({ ...s, takenAt: dates[k], visceralFatLevel: 8 + (i % 4) }, heightCm, f.sex),
    ),
    goals: [],
    notifications: [],
    lifts: [],
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

export function buildMembers(now: Date): MockMember[] {
  resetIds();
  return [mohamed(now), lina(now), omar(now), ...FILLERS.map((_, i) => filler(now, i)), sara(now)];
}
