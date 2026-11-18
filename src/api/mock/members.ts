/*
 * Mock members. See README.md in this folder for what each one is for.
 *
 *   101 Mohamed Omran  full history
 *   102 Lina Haddad    new member: no scans, no goals
 *   103 Omar Aziz      one scan
 *   104 Karim Mansour  the redesign's example: three InBody 770 scans with origin, ranges, extras, lean-only segments
 */
import type { AssessmentDto, NotificationDto, Sex } from '../types';
import {
  assessment,
  daysFrom,
  type GoalRecord,
  missionNotification,
  monthlyScanDates,
  resetIds,
  scanNotification,
  takeAssessmentId,
  thisMonthScan,
} from './fixtures';
import { KARIM_HEIGHT_CM, karimEarlierScan, karimLatestScan } from './inbodyExample';

export interface MockMember {
  id: number;
  fitId: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate: Date;
  heightCm: number;
  /** Oldest first. */
  assessments: AssessmentDto[];
  goals: GoalRecord[];
  notifications: NotificationDto[];
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
    assessments,
    goals: [
      {
        id: 1,
        title: 'Gain 3 kg of muscle',
        metric: 'MUSCLE_KG',
        startValue: 39.3,
        targetValue: 42.3,
        startDate: dates[3],
        status: 'ACTIVE',
        completedAt: null,
      },
      {
        id: 2,
        title: 'Lose 3 kg of body fat',
        metric: 'BODY_FAT_KG',
        startValue: 11.1,
        targetValue: 8.1,
        startDate: dates[0],
        status: 'COMPLETED',
        completedAt: dates[3],
      },
      {
        id: 3,
        title: 'Gain 2 kg of muscle',
        metric: 'MUSCLE_KG',
        startValue: 36.4,
        targetValue: 38.4,
        startDate: dates[0],
        status: 'COMPLETED',
        completedAt: dates[2],
      },
      {
        id: 4,
        title: 'Reach 82 kg',
        metric: 'WEIGHT_KG',
        startValue: 80.0,
        targetValue: 82.0,
        startDate: daysFrom(now, -3),
        status: 'ACTIVE',
        completedAt: null,
      },
    ],
    notifications: [
      scanNotification(dates[2], true),
      missionNotification(dates[3], 'Lose 3 kg of body fat', true),
      scanNotification(dates[4], false),
      scanNotification(dates[5], false),
    ],
  };
}

function lina(): MockMember {
  return {
    id: 2,
    fitId: '102',
    firstName: 'Lina',
    lastName: 'Haddad',
    sex: 'FEMALE',
    birthDate: new Date('1999-07-24T00:00:00Z'),
    heightCm: 164,
    assessments: [],
    goals: [],
    notifications: [],
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
    assessments: [scan],
    goals: [],
    notifications: [scanNotification(takenAt, false)],
  };
}

/** 08:00 in Cairo (06:00 UTC) on the day of this month's scan, never after `now`. */
function karimLatestDate(now: Date): Date {
  const day = thisMonthScan(now);
  const at = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 6));
  return at.getTime() <= now.getTime() ? at : daysFrom(at, -1);
}

/**
 * The redesign's example member: three scans on one InBody 770 over 3.5 months.
 * Since the first scan muscle is +1.0 kg and fat −2.3 kg (a real trend); the
 * latest vs the previous scan (+0.5 / −1.0) is inside the machine's noise.
 */
function karim(now: Date): MockMember {
  const latestAt = karimLatestDate(now);
  const assessments = [
    karimEarlierScan({
      id: takeAssessmentId(),
      takenAt: daysFrom(latestAt, -108),
      weightKg: 79.0,
      skeletalMuscleKg: 34.8,
      bodyFatKg: 17.2,
      bodyFatPct: 21.8,
      visceralFatLevel: 8,
    }),
    karimEarlierScan({
      id: takeAssessmentId(),
      takenAt: daysFrom(latestAt, -35),
      weightKg: 78.3,
      skeletalMuscleKg: 35.3,
      bodyFatKg: 15.95,
      bodyFatPct: 20.4,
      visceralFatLevel: 7,
    }),
    karimLatestScan(takeAssessmentId(), latestAt),
  ];
  return {
    id: 4,
    fitId: '104',
    firstName: 'Karim',
    lastName: 'Mansour',
    sex: 'MALE',
    birthDate: new Date('1988-03-09T00:00:00Z'),
    heightCm: KARIM_HEIGHT_CM,
    assessments,
    goals: [],
    notifications: [scanNotification(latestAt, false)],
  };
}

export function buildMembers(now: Date): MockMember[] {
  resetIds();
  return [mohamed(now), lina(), omar(now), karim(now)];
}
