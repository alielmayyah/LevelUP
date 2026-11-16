import type { LiftExercise, Sex } from '../../api/types';
import {
  MEDAL_RARITIES,
  type MedalCategory,
  type MedalComparison,
  type MedalDefinition,
  type MedalMeasurement,
} from './types';

type Five = readonly [number, number, number, number, number];

interface CategoryConfig {
  measurementType: MedalMeasurement;
  comparison: MedalComparison;
  unit: MedalDefinition['unit'];
  /** One id per rarity, lowest first; also the i18n keys under medals.medal. */
  ids?: readonly [string, string, string, string, string];
  /** Thresholds per rarity, lowest first. Body fat is set per sex. */
  thresholds: Five | Record<Sex, Five>;
  exercise?: LiftExercise;
}

const WORKOUT_MEASUREMENT = { kg: 'ONE_REP_MAX_KG', reps: 'CONSECUTIVE_REPS', seconds: 'DURATION_SECONDS' } as const;

const workout = (
  exercise: LiftExercise,
  thresholds: Five,
  unit: 'kg' | 'reps' | 'seconds' = 'kg',
  ids?: CategoryConfig['ids'],
): CategoryConfig => ({
  exercise,
  thresholds,
  unit,
  ids,
  comparison: 'atLeast',
  measurementType: WORKOUT_MEASUREMENT[unit],
});

export const MEDAL_CONFIG: Record<MedalCategory, CategoryConfig> = {
  pushUps: workout('PUSH_UP', [10, 20, 30, 50, 100], 'reps'),
  bench: workout('BENCH_PRESS', [20, 40, 60, 80, 100], 'kg', [
    'firstPress',
    'ironChest',
    'heavyHitter',
    'powerLifter',
    'benchLegend',
  ]),
  squat: workout('SQUAT', [40, 60, 80, 100, 140], 'kg', [
    'firstSquat',
    'ironLegs',
    'squatMaster',
    'titanLegs',
    'squatLegend',
  ]),
  deadlift: workout('DEADLIFT', [40, 60, 100, 140, 180]),
  militaryPress: workout('MILITARY_PRESS', [15, 25, 35, 45, 55]),
  pullUps: workout('PULL_UP', [1, 5, 10, 15, 20], 'reps'),
  plank: workout('PLANK', [30, 60, 120, 180, 300], 'seconds'),
  muscle: {
    measurementType: 'MUSCLE_GAIN_KG',
    comparison: 'atLeast',
    unit: 'kg',
    ids: ['muscleStarter', 'growingStrong', 'muscleBuilder', 'powerhouse', 'titan'],
    thresholds: [1, 3, 5, 10, 15],
  },
  bodyFat: {
    measurementType: 'BODY_FAT_PCT',
    comparison: 'below',
    unit: 'percent',
    ids: ['fatBurner', 'leanMachine', 'shredded', 'elitePhysique', 'legendaryShape'],
    thresholds: { MALE: [30, 25, 20, 15, 12], FEMALE: [38, 33, 28, 24, 21] },
  },
  bmi: {
    measurementType: 'BMI_MAINTENANCE',
    comparison: 'atLeast',
    unit: 'months',
    thresholds: [0, 1, 3, 6, 12],
  },
};

export const MEDAL_CATEGORIES = Object.keys(MEDAL_CONFIG) as MedalCategory[];

/** Plausible ranges; a value outside them is treated as an unsupported measurement. */
export const VALID_RANGE = {
  bodyFatPct: [3, 70],
  skeletalMuscleKg: [10, 90],
  liftKg: [1, 500],
} as const;

/** Every medal in a category. Body fat needs the member's sex; without it there are no thresholds. */
export function categoryDefinitions(category: MedalCategory, sex: Sex | null): MedalDefinition[] | null {
  const config = MEDAL_CONFIG[category];
  const { thresholds } = config;
  const list = 'MALE' in thresholds ? (sex ? thresholds[sex] : null) : thresholds;
  if (!list) return null;
  return MEDAL_RARITIES.map((rarity, order) => ({
    id: config.ids?.[order] ?? `${category}-${rarity}`,
    category,
    rarity,
    threshold: list[order],
    unit: config.unit,
    comparison: config.comparison,
    measurementType: config.measurementType,
    order,
  }));
}
