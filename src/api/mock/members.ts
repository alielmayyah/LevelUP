/*
 * Mock members. See README.md in this folder for what each one is for.
 *
 *   101 Sam Khalil   full history, opted in, coach assigned
 *   102 Lina Haddad  new member: no scans, no goals, opted out
 *   103 Omar Aziz    one scan, FitScore hidden, membership ends in 10 days
 *   104–139       36 opted-in fillers (18 men, 18 women) so both leaderboards have rows
 */
import type { AssessmentDto, NotificationDto, SettingsDto, Sex } from '../types';
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
}

function sam(now: Date): MockMember {
  const heightCm = 178;
  const dates = monthlyScanDates(now, 6);
  const series = [
    { weightKg: 86.0, bodyFatPct: 26.0, skeletalMuscleKg: 32.6, visceralFatLevel: 11, fitScore: 58 },
    { weightKg: 85.2, bodyFatPct: 25.1, skeletalMuscleKg: 33.0, visceralFatLevel: 11, fitScore: 61 },
    { weightKg: 84.5, bodyFatPct: 24.3, skeletalMuscleKg: 33.4, visceralFatLevel: 10, fitScore: 64 },
    { weightKg: 83.9, bodyFatPct: 23.4, skeletalMuscleKg: 33.8, visceralFatLevel: 10, fitScore: 66 },
    { weightKg: 83.3, bodyFatPct: 22.4, skeletalMuscleKg: 34.1, visceralFatLevel: 9, fitScore: 69 },
    { weightKg: 82.6, bodyFatPct: 21.2, skeletalMuscleKg: 34.9, visceralFatLevel: 9, fitScore: 72 },
  ];
  const assessments = series.map((s, i) => assessment({ ...s, takenAt: dates[i] }, heightCm, 'MALE'));
  return {
    id: 1,
    fitId: '101',
    firstName: 'Sam',
    lastName: 'Khalil',
    sex: 'MALE',
    birthDate: new Date('1994-03-12T00:00:00Z'),
    heightCm,
    membershipPlan: 'Premium · 12 months',
    membershipStart: midMonth(now, 8),
    membershipEnd: daysFrom(now, 120),
    coach: 'Rami Saad',
    settings: { showFitScore: true, fitScoreOnLeaderboard: true },
    assessments,
    goals: [
      {
        id: 1,
        title: 'Lose 5 kg of body fat',
        metric: 'BODY_FAT_KG',
        startValue: 20.5,
        targetValue: 15.5,
        startDate: midMonth(now, 3),
        deadline: daysFrom(now, 60),
        status: 'ACTIVE',
        coachNote: 'Keep protein high on training days.',
        completedAt: null,
      },
      {
        id: 2,
        title: 'Reach 85 kg',
        metric: 'WEIGHT_KG',
        startValue: 86.0,
        targetValue: 85.0,
        startDate: dates[0],
        deadline: dates[3],
        status: 'COMPLETED',
        coachNote: null,
        completedAt: dates[2],
      },
      {
        id: 3,
        title: 'Gain 1 kg of muscle',
        metric: 'MUSCLE_KG',
        startValue: 32.6,
        targetValue: 33.6,
        startDate: dates[0],
        deadline: dates[4],
        status: 'COMPLETED',
        coachNote: 'Great consistency.',
        completedAt: dates[3],
      },
      {
        id: 4,
        title: 'Gain 1.5 kg of muscle',
        metric: 'MUSCLE_KG',
        startValue: 34.9,
        targetValue: 36.4,
        startDate: daysFrom(now, 60),
        deadline: daysFrom(now, 180),
        status: 'UPCOMING',
        coachNote: null,
        completedAt: null,
      },
    ],
    notifications: [
      scanNotification(dates[2], 64, true),
      missionNotification(dates[3], 'Gain 1 kg of muscle', true),
      scanNotification(dates[4], 69, false),
      scanNotification(dates[5], 72, false),
    ],
  };
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
  };
}

function omar(now: Date): MockMember {
  const heightCm = 182;
  const takenAt = thisMonthScan(now);
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
    assessments: [
      assessment(
        { takenAt, weightKg: 91.4, bodyFatPct: 27.8, skeletalMuscleKg: 36.2, visceralFatLevel: 12, fitScore: 51 },
        heightCm,
        'MALE',
      ),
    ],
    goals: [],
    notifications: [scanNotification(takenAt, 51, false)],
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
  const baseFat = (f.sex === 'MALE' ? 17 : 25) + (100 - f.score) / 10;
  const baseMuscle = (f.sex === 'MALE' ? 35 : 26) + (f.score - 60) / 20;
  // Two scans: last month + this month, or two and one months ago.
  const dates = f.scannedThisMonth ? [midMonth(now, 1), thisMonthScan(now)] : [midMonth(now, 2), midMonth(now, 1)];
  // Varied monthly changes so the monthly boards differ from Top Score.
  const fatDrop = 0.3 + ((i * 7) % 10) / 10;
  const muscleGain = 0.2 + ((i * 3) % 8) / 10;
  const scoreGain = 1 + ((i * 5) % 6);
  const scans = [
    {
      weightKg: baseWeight + 0.8,
      bodyFatPct: round(baseFat + fatDrop),
      skeletalMuscleKg: round(baseMuscle - muscleGain),
      fitScore: f.score - scoreGain,
    },
    { weightKg: baseWeight, bodyFatPct: round(baseFat), skeletalMuscleKg: round(baseMuscle), fitScore: f.score },
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
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

export function buildMembers(now: Date): MockMember[] {
  resetIds();
  return [sam(now), lina(now), omar(now), ...FILLERS.map((_, i) => filler(now, i))];
}
