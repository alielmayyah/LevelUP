import { describe, expect, it } from 'vitest';

import type { AssessmentDto } from '../api/types';
import { adviceFor } from './advice';

const scan = (over: Partial<AssessmentDto> = {}): AssessmentDto => ({
  id: 1,
  takenAt: '2026-11-15T09:00:00.000Z',
  weightKg: 80,
  skeletalMuscleKg: 36,
  bodyFatKg: 12,
  bodyFatPct: 15,
  bmi: 23.9,
  visceralFatLevel: 5,
  totalBodyWaterKg: 48,
  proteinKg: 13,
  mineralsKg: 4.5,
  bmrKcal: 1750,
  fitScore: 70,
  segments: null,
  ...over,
});

const keys = (list: ReturnType<typeof adviceFor>) => list.map((a) => a.key);

describe('adviceFor', () => {
  it('puts belly fat and high body fat first, as things to act on', () => {
    const list = adviceFor(scan({ visceralFatLevel: 12, bodyFatPct: 27, bodyFatKg: 21.6 }), null, 'MALE', 183);
    expect(keys(list).slice(0, 2)).toEqual(['visceralHigh', 'fatHigh']);
    expect(list[0]).toMatchObject({ level: 'act', params: { level: 12, limit: 10 } });
    expect(list[1].params).toEqual({ pct: 27, max: 20 });
  });

  it('uses the women’s body-fat range for a female member', () => {
    expect(keys(adviceFor(scan({ bodyFatPct: 26 }), null, 'FEMALE', 165))).not.toContain('fatHigh');
    expect(keys(adviceFor(scan({ bodyFatPct: 26 }), null, 'MALE', 165))).toContain('fatHigh');
  });

  it('asks for more muscle when it is under the range for the height', () => {
    const list = adviceFor(scan({ skeletalMuscleKg: 25 }), null, 'MALE', 183);
    const muscle = list.find((a) => a.key === 'muscleLow');
    expect(muscle?.level).toBe('act');
    expect(muscle?.params.min).toBeGreaterThan(25);
  });

  it('flags fat going up and muscle going down since the last scan', () => {
    const before = scan({ bodyFatKg: 11, skeletalMuscleKg: 37 });
    const list = adviceFor(scan({ bodyFatKg: 12, skeletalMuscleKg: 36.5 }), before, 'MALE', 183);
    expect(list.find((a) => a.key === 'fatRising')).toMatchObject({ level: 'watch', params: { kg: 1 } });
    expect(list.find((a) => a.key === 'muscleDropping')).toMatchObject({ level: 'watch', params: { kg: 0.5 } });
  });

  it('ignores changes smaller than a scale can tell apart', () => {
    const before = scan({ bodyFatKg: 11.9, skeletalMuscleKg: 36.1 });
    expect(keys(adviceFor(scan(), before, 'MALE', 183))).not.toContain('fatRising');
    expect(keys(adviceFor(scan(), before, 'MALE', 183))).not.toContain('muscleDropping');
  });

  it('says what is going well when nothing needs work', () => {
    const list = adviceFor(scan({ skeletalMuscleKg: 40 }), null, 'MALE', 183);
    expect(list.every((a) => a.level === 'keep')).toBe(true);
    expect(keys(list)).toEqual(['muscleStrong', 'fatHealthy']);
  });

  it('suggests eating enough when body fat is under the range', () => {
    const list = adviceFor(scan({ bodyFatPct: 8, skeletalMuscleKg: 41 }), null, 'MALE', 183);
    expect(list[0]).toMatchObject({ key: 'fatLow', level: 'watch', params: { pct: 8, min: 10 } });
  });
});
