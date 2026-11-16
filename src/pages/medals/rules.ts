import type { LiftExercise, LiftRecordDto, ProgressPoint, Sex } from '../../api/types';
import { ageOn } from '../../body/age';
import { SCALES } from '../../body/standards';
import { categoryDefinitions, MEDAL_CATEGORIES, MEDAL_CONFIG, VALID_RANGE } from './config';
import {
  MEDAL_RARITIES,
  type MedalCategory,
  type MedalCategoryStatus,
  type MedalDefinition,
  type MedalStatus,
  type MedalUnavailableReason,
} from './types';

export interface MedalInputs {
  /** From the profile; body fat medals need it. */
  sex: Sex | null;
  birthDate?: string;
  heightCm?: number;
  /** Scans in any order; /me/progress returns them oldest first. */
  scans: ProgressPoint[];
  /** Null when the gym API doesn't provide workout records. */
  lifts: LiftRecordDto[] | null;
}

interface Sample {
  value: number;
  at: string;
}

const inRange = (value: unknown, [min, max]: readonly [number, number]): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

const byDate = (list: Sample[]) => [...list].sort((a, b) => a.at.localeCompare(b.at));

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Rounds away float noise such as 4.8999999 so values read cleanly. */
const tidy = (n: number) => Math.round(n * 100) / 100;

/** Body fat % from each scan that reports a plausible value, oldest first. */
export function bodyFatSamples(scans: ProgressPoint[]): Sample[] {
  return byDate(
    scans
      .filter((s) => inRange(s.bodyFatPct, VALID_RANGE.bodyFatPct))
      .map((s) => ({ value: s.bodyFatPct, at: s.takenAt })),
  );
}

/** Muscle gained since the first supported scan, for every later scan. Empty with fewer than two scans. */
export function muscleGainSamples(scans: ProgressPoint[]): Sample[] {
  const valid = byDate(
    scans
      .filter((s) => inRange(s.skeletalMuscleKg, VALID_RANGE.skeletalMuscleKg))
      .map((s) => ({ value: s.skeletalMuscleKg, at: s.takenAt })),
  );
  if (valid.length < 2) return [];
  const [baseline, ...later] = valid;
  return later.map((s) => ({ value: tidy(s.value - baseline.value), at: s.at }));
}

/** Verified one-rep maxes for an exercise, oldest first. Working sets and unverified lifts never count. */
export function oneRepMaxSamples(lifts: LiftRecordDto[], exercise: LiftExercise): Sample[] {
  return byDate(
    lifts
      .filter(
        (l) =>
          l.exercise === exercise &&
          l.verified &&
          l.measurement === 'ONE_REP_MAX' &&
          l.reps === 1 &&
          inRange(l.weightKg, VALID_RANGE.liftKg),
      )
      .map((l) => ({ value: l.weightKg, at: l.recordedAt })),
  );
}

function workoutSamples(lifts: LiftRecordDto[], exercise: LiftExercise, unit: MedalDefinition['unit']): Sample[] {
  if (unit === 'kg') return oneRepMaxSamples(lifts, exercise);
  const measurement = unit === 'reps' ? 'CONSECUTIVE_REPS' : 'DURATION';
  return byDate(
    lifts.flatMap((lift) => {
      const value = unit === 'reps' ? lift.reps : lift.durationSeconds;
      if (lift.exercise !== exercise || !lift.verified || lift.measurement !== measurement) return [];
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return [];
      if (unit === 'reps' && !Number.isInteger(value)) return [];
      return [{ value, at: lift.recordedAt }];
    }),
  );
}

const BMI_MIN_AGE = 20;
const MAX_BMI_GAP = 45 * 24 * 60 * 60 * 1000;

function completedMonths(start: Date, end: Date): number {
  const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  return months - Number(end.getUTCDate() < Math.min(start.getUTCDate(), lastDay));
}

function bmiStreaks(scans: ProgressPoint[], heightCm: number, birth: Date) {
  const [minimum, maximum] = SCALES.bmi.normal;
  const assessment = scans
    .map((scan) => ({ at: scan.takenAt, date: new Date(scan.takenAt), bmi: scan.weightKg / (heightCm / 100) ** 2 }))
    .filter(({ date, bmi }) => Number.isFinite(bmi) && bmi > 0 && ageOn(birth, date) >= BMI_MIN_AGE)
    .sort((a, b) => +a.date - +b.date);
  const samples: Sample[] = [];
  let started: Date | null = null;
  let last: Date | null = null;
  for (const { at, date, bmi } of assessment) {
    if (bmi < minimum || bmi >= maximum) {
      started = null;
      last = null;
      continue;
    }
    if (!started || !last || +date - +last > MAX_BMI_GAP) started = date;
    samples.push({ at, value: completedMonths(started, date) });
    last = date;
  }
  return {
    samples,
    eligibleScans: assessment.length,
    current: last ? samples[samples.length - 1].value : null,
  };
}

const meets = (def: MedalDefinition, value: number) =>
  def.comparison === 'below' ? value < def.threshold : value >= def.threshold;

/**
 * Progress toward a locked medal, from the start value (the first scan for
 * body fat, zero otherwise) to the threshold. Always between 0 and 1.
 */
function progressToward(def: MedalDefinition, current: number, start: number) {
  if (def.comparison === 'atLeast') {
    return { progress: clamp01(current / def.threshold), remaining: tidy(Math.max(0, def.threshold - current)) };
  }
  const remaining = tidy(Math.max(0, current - def.threshold));
  // Started at or below the line yet still locked can't happen; guard the division anyway.
  if (start <= def.threshold) return { progress: null, remaining };
  return { progress: clamp01((start - current) / (start - def.threshold)), remaining };
}

function evaluate(defs: MedalDefinition[], samples: Sample[], current: number | null, start: number): MedalStatus[] {
  return defs.map((def) => {
    // Medals are permanent: the first measurement that met the threshold unlocks it.
    const first = samples.find((s) => meets(def, s.value));
    if (first) return { ...def, unlocked: true, unlockedAt: first.at, current, progress: 1, remaining: null };
    const progress = current === null ? { progress: null, remaining: null } : progressToward(def, current, start);
    return { ...def, unlocked: false, unlockedAt: null, current, ...progress };
  });
}

const lockedAll = (defs: MedalDefinition[]): MedalStatus[] =>
  defs.map((def) => ({ ...def, unlocked: false, unlockedAt: null, current: null, progress: null, remaining: null }));

function evaluateCategory(category: MedalCategory, inputs: MedalInputs): MedalCategoryStatus {
  const base = { category, bestWorkingSet: null, pendingLifts: 0 };
  // Without a sex there are no body fat thresholds; the medals still show (male set), locked.
  const defs = categoryDefinitions(category, inputs.sex) ?? categoryDefinitions(category, 'MALE')!;
  const unavailable = (reason: MedalUnavailableReason): MedalCategoryStatus => ({
    ...base,
    current: null,
    unavailable: reason,
    medals: lockedAll(defs),
  });

  if (category === 'bodyFat') {
    if (!inputs.sex) return unavailable('needsProfile');
    const samples = bodyFatSamples(inputs.scans);
    if (!samples.length) return unavailable('noScans');
    const current = samples[samples.length - 1].value;
    return { ...base, current, unavailable: null, medals: evaluate(defs, samples, current, samples[0].value) };
  }

  if (category === 'muscle') {
    const samples = muscleGainSamples(inputs.scans);
    if (!samples.length) {
      const anyScan = inputs.scans.some((s) => inRange(s.skeletalMuscleKg, VALID_RANGE.skeletalMuscleKg));
      return unavailable(anyScan ? 'needsSecondScan' : 'noScans');
    }
    const current = samples[samples.length - 1].value;
    return { ...base, current, unavailable: null, medals: evaluate(defs, samples, current, 0) };
  }

  if (category === 'bmi') {
    const birth = new Date(inputs.birthDate ?? '');
    const height = inputs.heightCm;
    if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0 || !Number.isFinite(+birth))
      return unavailable('missingBmiProfile');
    if (ageOn(birth, new Date()) < BMI_MIN_AGE) return unavailable('adultBmiOnly');
    const { samples, current, eligibleScans } = bmiStreaks(inputs.scans, height, birth);
    return {
      ...base,
      current,
      unavailable: !eligibleScans ? 'noScans' : current === null ? 'bmiOutsideRange' : null,
      medals: evaluate(defs, samples, current, 0),
    };
  }

  if (!inputs.lifts) return unavailable('noWorkoutSource');
  const { exercise, unit } = MEDAL_CONFIG[category];
  const mine = inputs.lifts.filter((l) => l.exercise === exercise);
  const bestWorkingSet = mine
    .filter((l) => l.verified && l.measurement === 'WORKING_SET' && inRange(l.weightKg, VALID_RANGE.liftKg))
    .reduce<{ weightKg: number; reps: number } | null>(
      (best, l) => (!best || l.weightKg > best.weightKg ? { weightKg: l.weightKg, reps: l.reps } : best),
      null,
    );
  const lift = { bestWorkingSet, pendingLifts: mine.filter((l) => !l.verified).length };
  const samples = workoutSamples(mine, exercise!, unit);
  if (!samples.length) return { ...unavailable(unit === 'kg' ? 'noLifts' : 'noWorkoutRecord'), ...lift };
  const current = Math.max(...samples.map((s) => s.value));
  return { ...base, ...lift, current, unavailable: null, medals: evaluate(defs, samples, current, 0) };
}

export function evaluateMedals(inputs: MedalInputs): MedalCategoryStatus[] {
  return MEDAL_CATEGORIES.map((category) => evaluateCategory(category, inputs));
}

export function medalSummary(categories: MedalCategoryStatus[]) {
  const medals = categories.flatMap((c) => c.medals);
  const unlocked = medals.filter((m) => m.unlocked);
  return {
    total: medals.length,
    unlocked: unlocked.length,
    locked: medals.length - unlocked.length,
    percent: medals.length ? Math.round((unlocked.length / medals.length) * 100) : 0,
  };
}

/** One representative medal per category, with the next milestone's evaluated progress. */
export function medalShowcase(categories: MedalCategoryStatus[]) {
  const slots = categories.flatMap(({ medals }) => {
    const tiers = [...medals].sort((a, b) => a.order - b.order);
    const earned = tiers.filter((medal) => medal.unlocked).at(-1);
    const next = tiers.find((medal) => !medal.unlocked && (!earned || medal.order > earned.order));
    const medal = earned ?? next;
    return medal ? [{ medal, next }] : [];
  });
  return { slots, unlocked: slots.filter(({ medal }) => medal.unlocked).length };
}

/**
 * Unlocked medals the member hasn't been shown yet, rarest first. Pure, so the
 * celebration is idempotent: once an id is in `seen` it never comes back.
 */
export function unseenUnlocks(categories: MedalCategoryStatus[], seen: ReadonlySet<string>): MedalStatus[] {
  const rank = (m: MedalStatus) => MEDAL_RARITIES.indexOf(m.rarity);
  return categories
    .flatMap((c) => c.medals)
    .filter((m) => m.unlocked && !seen.has(m.id))
    .sort((a, b) => rank(b) - rank(a) || MEDAL_CATEGORIES.indexOf(a.category) - MEDAL_CATEGORIES.indexOf(b.category));
}
