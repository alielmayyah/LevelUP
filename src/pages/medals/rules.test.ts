import { describe, expect, it } from 'vitest';

import type { LiftRecordDto, ProgressPoint } from '../../api/types';
import { categoryDefinitions, MEDAL_CATEGORIES } from './config';
import {
  evaluateMedals,
  medalShowcase,
  medalSummary,
  muscleGainSamples,
  oneRepMaxSamples,
  unseenUnlocks,
  type MedalInputs,
} from './rules';
import type { MedalCategory } from './types';

const scan = (takenAt: string, bodyFatPct: number, skeletalMuscleKg: number): ProgressPoint => ({
  takenAt,
  weightKg: 80,
  bodyFatPct,
  skeletalMuscleKg,
  fitScore: 70,
});

let liftId = 0;
const lift = (
  exercise: LiftRecordDto['exercise'],
  weightKg: number,
  recordedAt: string,
  extra: Partial<LiftRecordDto> = {},
): LiftRecordDto => ({
  id: ++liftId,
  exercise,
  measurement: 'ONE_REP_MAX',
  weightKg,
  reps: 1,
  recordedAt,
  verified: true,
  ...extra,
});

const EMPTY: MedalInputs = { sex: 'MALE', scans: [], lifts: [] };
const category = (inputs: MedalInputs, id: MedalCategory) => evaluateMedals(inputs).find((c) => c.category === id)!;
const unlockedIds = (inputs: MedalInputs, id: MedalCategory) =>
  category(inputs, id)
    .medals.filter((m) => m.unlocked)
    .map((m) => m.id);

describe('medal definitions', () => {
  it('defines 50 medals, five rarities per category, with unique ids', () => {
    const all = MEDAL_CATEGORIES.flatMap((c) => categoryDefinitions(c, 'MALE')!);
    expect(all).toHaveLength(50);
    expect(new Set(all.map((m) => m.id)).size).toBe(50);
    for (const c of MEDAL_CATEGORIES) {
      const defs = categoryDefinitions(c, 'MALE')!;
      expect(defs.map((d) => d.rarity)).toEqual(['bronze', 'silver', 'gold', 'epic', 'legendary']);
    }
  });

  it('uses the reference thresholds', () => {
    const thresholds = (c: MedalCategory) => categoryDefinitions(c, 'MALE')!.map((d) => d.threshold);
    expect(thresholds('bodyFat')).toEqual([30, 25, 20, 15, 12]);
    expect(thresholds('muscle')).toEqual([1, 3, 5, 10, 15]);
    expect(thresholds('bench')).toEqual([20, 40, 60, 80, 100]);
    expect(thresholds('squat')).toEqual([40, 60, 80, 100, 140]);
    expect(thresholds('pushUps')).toEqual([10, 20, 30, 50, 100]);
    expect(thresholds('deadlift')).toEqual([40, 60, 100, 140, 180]);
    expect(thresholds('militaryPress')).toEqual([15, 25, 35, 45, 55]);
    expect(thresholds('pullUps')).toEqual([1, 5, 10, 15, 20]);
    expect(thresholds('plank')).toEqual([30, 60, 120, 180, 300]);
    expect(thresholds('bmi')).toEqual([0, 1, 3, 6, 12]);
  });

  it('sets body fat thresholds by sex and has none without one', () => {
    expect(categoryDefinitions('bodyFat', 'FEMALE')!.map((d) => d.threshold)).toEqual([38, 33, 28, 24, 21]);
    expect(categoryDefinitions('bodyFat', null)).toBeNull();
  });
});

describe('body fat medals', () => {
  it.each([30, 25, 20, 15, 12])('unlock only strictly below %s%%', (threshold) => {
    const at = (pct: number) =>
      category({ ...EMPTY, scans: [scan('2026-01-01', pct, 35)] }, 'bodyFat').medals.find(
        (m) => m.threshold === threshold,
      )!.unlocked;
    expect(at(threshold)).toBe(false);
    expect(at(threshold - 0.1)).toBe(true);
  });

  it('stay unlocked after a later scan goes back up, dated by the first qualifying scan', () => {
    const inputs = { ...EMPTY, scans: [scan('2026-01-01', 24, 35), scan('2026-02-01', 26, 35)] };
    const medal = category(inputs, 'bodyFat').medals.find((m) => m.id === 'leanMachine')!;
    expect(medal.unlocked).toBe(true);
    expect(medal.unlockedAt).toBe('2026-01-01');
    expect(category(inputs, 'bodyFat').current).toBe(26);
  });

  it('measure progress from the first scan to the threshold, never above 100%', () => {
    const inputs = { ...EMPTY, scans: [scan('2026-01-01', 28, 35), scan('2026-02-01', 22, 35)] };
    const shredded = category(inputs, 'bodyFat').medals.find((m) => m.id === 'shredded')!;
    expect(shredded.progress).toBeCloseTo(0.75);
    expect(shredded.remaining).toBe(2);
    for (const m of category(inputs, 'bodyFat').medals) expect(m.progress ?? 0).toBeLessThanOrEqual(1);
  });

  it('ignore implausible readings and need the member’s sex', () => {
    expect(category({ ...EMPTY, scans: [scan('2026-01-01', 1, 35)] }, 'bodyFat').unavailable).toBe('noScans');
    expect(category({ ...EMPTY, scans: [scan('2026-01-01', Number.NaN, 35)] }, 'bodyFat').unavailable).toBe('noScans');
    const noSex = category({ ...EMPTY, sex: null, scans: [scan('2026-01-01', 10, 35)] }, 'bodyFat');
    expect(noSex.unavailable).toBe('needsProfile');
    expect(noSex.medals.every((m) => !m.unlocked && m.progress === null)).toBe(true);
  });
});

describe('muscle medals', () => {
  it('count muscle gained since the first scan, not total muscle mass', () => {
    const scans = [scan('2026-01-01', 20, 36.4), scan('2026-06-01', 20, 41.3)];
    expect(muscleGainSamples(scans).map((s) => s.value)).toEqual([4.9]);
    expect(unlockedIds({ ...EMPTY, scans }, 'muscle')).toEqual(['muscleStarter', 'growingStrong']);
    const builder = category({ ...EMPTY, scans }, 'muscle').medals.find((m) => m.id === 'muscleBuilder')!;
    expect(builder.progress).toBeCloseTo(0.98);
    expect(builder.remaining).toBe(0.1);
  });

  it('unlock at exactly the threshold', () => {
    const scans = [scan('2026-01-01', 20, 30), scan('2026-02-01', 20, 33)];
    expect(unlockedIds({ ...EMPTY, scans }, 'muscle')).toEqual(['muscleStarter', 'growingStrong']);
  });

  it('need a second scan, and show no progress for a loss', () => {
    expect(category({ ...EMPTY, scans: [scan('2026-01-01', 20, 35)] }, 'muscle').unavailable).toBe('needsSecondScan');
    expect(category(EMPTY, 'muscle').unavailable).toBe('noScans');
    const loss = category({ ...EMPTY, scans: [scan('2026-01-01', 20, 35), scan('2026-02-01', 20, 34)] }, 'muscle');
    expect(loss.current).toBe(-1);
    expect(loss.medals.every((m) => !m.unlocked && m.progress === 0)).toBe(true);
  });
});

describe('lift medals', () => {
  it('count only verified one-rep maxes', () => {
    const lifts = [
      lift('BENCH_PRESS', 60, '2026-01-01'),
      lift('BENCH_PRESS', 110, '2026-02-01', { verified: false }),
      lift('BENCH_PRESS', 90, '2026-03-01', { measurement: 'WORKING_SET', reps: 5 }),
      lift('BENCH_PRESS', 120, '2026-03-02', { reps: 3 }),
      lift('SQUAT', 200, '2026-03-01'),
    ];
    expect(oneRepMaxSamples(lifts, 'BENCH_PRESS').map((s) => s.value)).toEqual([60]);
    const bench = category({ ...EMPTY, lifts }, 'bench');
    expect(unlockedIds({ ...EMPTY, lifts }, 'bench')).toEqual(['firstPress', 'ironChest', 'heavyHitter']);
    expect(bench.bestWorkingSet).toEqual({ weightKg: 90, reps: 5 });
    expect(bench.pendingLifts).toBe(1);
  });

  it('reports progress as current over target', () => {
    const bench = category({ ...EMPTY, lifts: [lift('BENCH_PRESS', 16, '2026-01-01')] }, 'bench');
    const first = bench.medals[0];
    expect(first.unlocked).toBe(false);
    expect(first.current).toBe(16);
    expect(first.progress).toBe(0.8);
    expect(first.remaining).toBe(4);
  });

  it('unlock at exactly the threshold and date each medal by the lift that earned it', () => {
    const lifts = [lift('SQUAT', 60, '2026-01-01'), lift('SQUAT', 100, '2026-04-01'), lift('SQUAT', 90, '2026-05-01')];
    const squat = category({ ...EMPTY, lifts }, 'squat');
    expect(squat.current).toBe(100);
    expect(squat.medals.map((m) => m.unlockedAt)).toEqual([
      '2026-01-01',
      '2026-01-01',
      '2026-04-01',
      '2026-04-01',
      null,
    ]);
  });

  it('show no progress without a verified lift', () => {
    const squat = category({ ...EMPTY, lifts: [lift('SQUAT', 100, '2026-01-01', { verified: false })] }, 'squat');
    expect(squat.unavailable).toBe('noLifts');
    expect(squat.pendingLifts).toBe(1);
    expect(squat.medals.every((m) => m.progress === null && m.current === null)).toBe(true);
  });

  it('reject impossible weights', () => {
    expect(oneRepMaxSamples([lift('SQUAT', 0, '2026-01-01'), lift('SQUAT', 900, '2026-01-01')], 'SQUAT')).toEqual([]);
  });

  it('uses only the correct verified record type for reps and time', () => {
    const lifts = [
      lift('PUSH_UP', 0, '2026-01-01', { measurement: 'CONSECUTIVE_REPS', reps: 20 }),
      lift('PUSH_UP', 0, '2026-01-01', { measurement: 'WORKING_SET', reps: 100 }),
      lift('PULL_UP', 0, '2026-01-01', { measurement: 'CONSECUTIVE_REPS', reps: 20, verified: false }),
      lift('PLANK', 0, '2026-01-01', { measurement: 'DURATION', durationSeconds: 120 }),
      lift('PLANK', 0, '2026-01-01', { measurement: 'DURATION', durationSeconds: 300, verified: false }),
    ];
    expect(unlockedIds({ ...EMPTY, lifts }, 'pushUps')).toEqual(['pushUps-bronze', 'pushUps-silver']);
    expect(unlockedIds({ ...EMPTY, lifts }, 'pullUps')).toEqual([]);
    expect(unlockedIds({ ...EMPTY, lifts }, 'plank')).toEqual(['plank-bronze', 'plank-silver', 'plank-gold']);
    expect(category({ ...EMPTY, lifts: null }, 'plank').unavailable).toBe('noWorkoutSource');
  });
});

describe('BMI medals', () => {
  const adult = { ...EMPTY, heightCm: 200, birthDate: '1990-01-01' };
  const reading = (at: string, bmi: number) => ({ ...scan(at, 20, 35), weightKg: bmi * 4 });

  it('includes 18.5 and excludes 25 when the member first enters the adult range', () => {
    expect(unlockedIds({ ...adult, scans: [reading('2026-01-01', 25)] }, 'bmi')).toEqual([]);
    expect(unlockedIds({ ...adult, scans: [reading('2026-01-01', 18.5)] }, 'bmi')).toEqual(['bmi-bronze']);
  });

  it('waits for timed in-range scans, resets after an out-of-range scan or a gap, and preserves earned medals', () => {
    const scans = [
      reading('2026-01-31', 22),
      reading('2026-02-28', 22),
      reading('2026-03-30', 22),
      reading('2026-04-30', 22),
      reading('2026-05-15', 26),
      reading('2026-06-01', 22),
      reading('2026-08-01', 22),
    ];
    const bmi = category({ ...adult, scans }, 'bmi');
    expect(bmi.current).toBe(0);
    expect(bmi.medals.map((medal) => medal.unlockedAt)).toEqual(['2026-01-31', '2026-02-28', '2026-04-30', null, null]);
    expect(category({ ...adult, birthDate: '2010-01-01', scans }, 'bmi').unavailable).toBe('adultBmiOnly');
  });
});

describe('summary and celebrations', () => {
  const inputs: MedalInputs = {
    sex: 'MALE',
    scans: [scan('2026-01-01', 22, 35), scan('2026-02-01', 19, 36.5)],
    lifts: [lift('BENCH_PRESS', 80, '2026-02-01')],
  };

  it('totals unlocked and locked medals', () => {
    expect(medalSummary(evaluateMedals(inputs))).toEqual({ total: 50, unlocked: 8, locked: 42, percent: 16 });
  });

  it('celebrates each unlock once, rarest first', () => {
    const categories = evaluateMedals(inputs);
    const first = unseenUnlocks(categories, new Set());
    expect(first.map((m) => m.id)).toEqual([
      'powerLifter',
      'heavyHitter',
      'shredded',
      'ironChest',
      'leanMachine',
      'firstPress',
      'muscleStarter',
      'fatBurner',
    ]);
    const seen = new Set(first.map((m) => m.id));
    expect(unseenUnlocks(categories, seen)).toEqual([]);
    expect(unseenUnlocks(evaluateMedals(inputs), seen)).toEqual([]);
  });
});

describe('Profile medal showcase', () => {
  it.each([
    [30, 'bronze', 'silver'],
    [60, 'silver', 'gold'],
    [120, 'gold', 'epic'],
    [180, 'epic', 'legendary'],
    [300, 'legendary', undefined],
  ])('shows one medal for a %s-second plank', (durationSeconds, rarity, nextRarity) => {
    const lifts = [lift('PLANK', 0, '2026-01-01', { measurement: 'DURATION', durationSeconds })];
    const categories = evaluateMedals({ ...EMPTY, lifts });
    const summary = medalShowcase(categories);
    const plank = summary.slots.filter(({ medal }) => medal.category === 'plank');
    expect(plank).toHaveLength(1);
    expect(plank[0].medal).toMatchObject({ rarity, threshold: durationSeconds, unlocked: true });
    expect(plank[0].next?.rarity).toBe(nextRarity);
    expect(summary.unlocked).toBe(1);
    expect(summary.slots).toHaveLength(10);
    expect(categories.find((status) => status.category === 'plank')?.medals).toHaveLength(5);
  });

  it('shows one locked starter per category and only progress backed by a record', () => {
    const empty = medalShowcase(evaluateMedals(EMPTY));
    expect(empty.unlocked).toBe(0);
    expect(empty.slots).toHaveLength(10);
    expect(empty.slots.every(({ medal, next }) => medal === next && !medal.unlocked && medal.progress === null)).toBe(
      true,
    );

    const lifts = [lift('PLANK', 0, '2026-01-01', { measurement: 'DURATION', durationSeconds: 15 })];
    const plank = medalShowcase(evaluateMedals({ ...EMPTY, lifts })).slots.find(
      ({ medal }) => medal.category === 'plank',
    );
    expect(plank?.medal).toMatchObject({ rarity: 'bronze', unlocked: false, threshold: 30 });
    expect(plank?.next).toMatchObject({ current: 15, progress: 0.5 });
  });
});
