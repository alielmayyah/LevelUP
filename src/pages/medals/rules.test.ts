import { describe, expect, it } from 'vitest';

import type { ProgressPoint } from '../../api/types';
import { categoryDefinitions, MEDAL_CATEGORIES } from './config';
import {
  evaluateMedals,
  medalShowcase,
  medalSummary,
  muscleGainSamples,
  unseenUnlocks,
  type MedalInputs,
} from './rules';
import type { MedalCategory } from './types';

const scan = (takenAt: string, bodyFatPct: number, skeletalMuscleKg: number): ProgressPoint => ({
  takenAt,
  weightKg: 80,
  bodyFatPct,
  skeletalMuscleKg,
});

const EMPTY: MedalInputs = { sex: 'MALE', scans: [] };
const category = (inputs: MedalInputs, id: MedalCategory) => evaluateMedals(inputs).find((c) => c.category === id)!;
const unlockedIds = (inputs: MedalInputs, id: MedalCategory) =>
  category(inputs, id)
    .medals.filter((m) => m.unlocked)
    .map((m) => m.id);

describe('medal definitions', () => {
  it('defines 15 scan medals (muscle, body fat, BMI), five rarities each, with unique ids', () => {
    expect(MEDAL_CATEGORIES).toEqual(['muscle', 'bodyFat', 'bmi']);
    const all = MEDAL_CATEGORIES.flatMap((c) => categoryDefinitions(c, 'MALE')!);
    expect(all).toHaveLength(15);
    expect(new Set(all.map((m) => m.id)).size).toBe(15);
    for (const c of MEDAL_CATEGORIES) {
      const defs = categoryDefinitions(c, 'MALE')!;
      expect(defs.map((d) => d.rarity)).toEqual(['bronze', 'silver', 'gold', 'epic', 'legendary']);
    }
  });

  it('uses the reference thresholds', () => {
    const thresholds = (c: MedalCategory) => categoryDefinitions(c, 'MALE')!.map((d) => d.threshold);
    expect(thresholds('bodyFat')).toEqual([30, 25, 20, 15, 12]);
    expect(thresholds('muscle')).toEqual([1, 3, 5, 10, 15]);
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
  };

  it('totals unlocked and locked medals', () => {
    expect(medalSummary(evaluateMedals(inputs))).toEqual({ total: 15, unlocked: 4, locked: 11, percent: 27 });
  });

  it('celebrates each unlock once, rarest first', () => {
    const categories = evaluateMedals(inputs);
    const first = unseenUnlocks(categories, new Set());
    expect(first.map((m) => m.id)).toEqual(['shredded', 'leanMachine', 'muscleStarter', 'fatBurner']);
    const seen = new Set(first.map((m) => m.id));
    expect(unseenUnlocks(categories, seen)).toEqual([]);
    expect(unseenUnlocks(evaluateMedals(inputs), seen)).toEqual([]);
  });
});

describe('Profile medal showcase', () => {
  /** Two scans with `gain` kg more muscle on the second, and body fat too high for any medal. */
  const gained = (gain: number): MedalInputs => ({
    ...EMPTY,
    scans: [scan('2026-01-01', 35, 30), scan('2026-02-01', 35, 30 + gain)],
  });

  it.each([
    [1, 'bronze', 'silver'],
    [3, 'silver', 'gold'],
    [5, 'gold', 'epic'],
    [10, 'epic', 'legendary'],
    [15, 'legendary', undefined],
  ])('shows one medal for %s kg of muscle gained', (gain, rarity, nextRarity) => {
    const categories = evaluateMedals(gained(gain));
    const summary = medalShowcase(categories);
    const muscle = summary.slots.filter(({ medal }) => medal.category === 'muscle');
    expect(muscle).toHaveLength(1);
    expect(muscle[0].medal).toMatchObject({ rarity, threshold: gain, unlocked: true });
    expect(muscle[0].next?.rarity).toBe(nextRarity);
    expect(summary.unlocked).toBe(1);
    expect(summary.slots).toHaveLength(3);
    expect(categories.find((status) => status.category === 'muscle')?.medals).toHaveLength(5);
  });

  it('shows one locked starter per category and only progress backed by a scan', () => {
    const empty = medalShowcase(evaluateMedals(EMPTY));
    expect(empty.unlocked).toBe(0);
    expect(empty.slots).toHaveLength(3);
    expect(empty.slots.every(({ medal, next }) => medal === next && !medal.unlocked && medal.progress === null)).toBe(
      true,
    );

    const muscle = medalShowcase(evaluateMedals(gained(0.5))).slots.find(({ medal }) => medal.category === 'muscle');
    expect(muscle?.medal).toMatchObject({ rarity: 'bronze', unlocked: false, threshold: 1 });
    expect(muscle?.next).toMatchObject({ current: 0.5, progress: 0.5 });
  });
});
