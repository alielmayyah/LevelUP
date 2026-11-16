export type MedalCategory =
  'pushUps' | 'bench' | 'squat' | 'deadlift' | 'militaryPress' | 'pullUps' | 'plank' | 'muscle' | 'bodyFat' | 'bmi';

export const MEDAL_RARITIES = ['bronze', 'silver', 'gold', 'epic', 'legendary'] as const;
export type MedalRarity = (typeof MEDAL_RARITIES)[number];

/** What a medal's threshold is compared against. */
export type MedalMeasurement =
  /** Body fat % from supported scans. */
  | 'BODY_FAT_PCT'
  /** Skeletal muscle gained since the member's first scan (not total muscle mass). */
  | 'MUSCLE_GAIN_KG'
  /** A coach-verified one-rep max. Working sets are reported but never counted. */
  | 'ONE_REP_MAX_KG'
  | 'CONSECUTIVE_REPS'
  | 'DURATION_SECONDS'
  | 'BMI_MAINTENANCE';

export type MedalComparison = 'below' | 'atLeast';

/** One configurable medal: everything the art and the rules need, no copy. */
export interface MedalDefinition {
  /** Stable id, also the i18n key under medals.medal. */
  id: string;
  category: MedalCategory;
  rarity: MedalRarity;
  threshold: number;
  unit: 'percent' | 'kg' | 'reps' | 'seconds' | 'months';
  comparison: MedalComparison;
  measurementType: MedalMeasurement;
  /** Position inside its category, 0 = first medal. */
  order: number;
}

/** Why a category can't be judged yet. */
export type MedalUnavailableReason =
  | 'noScans'
  | 'needsSecondScan'
  | 'needsProfile'
  | 'noLifts'
  | 'noWorkoutRecord'
  | 'noWorkoutSource'
  | 'missingBmiProfile'
  | 'adultBmiOnly'
  | 'bmiOutsideRange';

export interface MedalStatus extends MedalDefinition {
  unlocked: boolean;
  /** When the first qualifying measurement was taken; null while locked. */
  unlockedAt: string | null;
  /** The member's current value for this medal's measurement, or null without data. */
  current: number | null;
  /** 0–1 toward this medal; null when there is no honest way to show progress. */
  progress: number | null;
  /** How much is left to reach the threshold, in the medal's unit; null when unknown or unlocked. */
  remaining: number | null;
}

export interface MedalCategoryStatus {
  category: MedalCategory;
  current: number | null;
  /** Set when there isn't enough supported data to judge the category. */
  unavailable: MedalUnavailableReason | null;
  medals: MedalStatus[];
  /** Lift categories: the heaviest verified working set, shown apart from one-rep maxes. */
  bestWorkingSet: { weightKg: number; reps: number } | null;
  /** Lift categories: lifts still waiting for a coach to verify them. */
  pendingLifts: number;
}
