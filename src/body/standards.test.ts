import { describe, expect, it } from 'vitest';

import { bodyStandards, kgRange, SCALES, scalePosition, statusFor } from './standards';

describe('body standards', () => {
  it('match the normal ranges printed on a real InBody sheet (180 cm man)', () => {
    const std = bodyStandards(180, 'MALE');
    const r = (range: [number, number], digits = 1) => range.map((n) => Number(n.toFixed(digits)));
    expect(r(kgRange(std.weightKg, SCALES.weight.normal))).toEqual([60.6, 82.0]);
    expect(r(kgRange(std.fatKg, SCALES.fat.normal))).toEqual([8.6, 17.1]);
    expect(r(kgRange(std.smmKg, SCALES.smm.normal))).toEqual([30.6, 37.4]);
    expect(r(kgRange(std.waterKg))).toEqual([40.1, 49.0]);
    expect(r(kgRange(std.proteinKg))).toEqual([10.7, 13.1]);
    expect(r(kgRange(std.mineralsKg), 2)).toEqual([3.71, 4.53]);
  });

  it('women have a lower standard weight and a higher fat share', () => {
    const m = bodyStandards(165, 'MALE');
    const f = bodyStandards(165, 'FEMALE');
    expect(f.weightKg).toBeLessThan(m.weightKg);
    expect(f.fatKg / f.weightKg).toBeGreaterThan(m.fatKg / m.weightKg);
  });
});

describe('scalePosition', () => {
  it('reads uneven ticks piece by piece', () => {
    // Fat: 40, 60, 80, 100, 160 … — 100% is the 4th tick of 11, 130% halfway to the 5th.
    expect(scalePosition(SCALES.fat, 100)).toBeCloseTo(0.3);
    expect(scalePosition(SCALES.fat, 130)).toBeCloseTo(0.35);
  });

  it('every main scale puts its normal band at 20–40% of the bar', () => {
    for (const s of [SCALES.weight, SCALES.smm, SCALES.fat, SCALES.bmi, SCALES.pbfMale, SCALES.pbfFemale]) {
      expect(scalePosition(s, s.normal[0])).toBeCloseTo(0.2);
      expect(scalePosition(s, s.normal[1])).toBeCloseTo(0.4);
    }
  });

  it('clamps at both ends and treats a missing value as the start', () => {
    expect(scalePosition(SCALES.weight, 10)).toBe(0);
    expect(scalePosition(SCALES.weight, 400)).toBe(1);
    expect(scalePosition(SCALES.weight, Number.NaN)).toBe(0);
  });
});

describe('statusFor', () => {
  it('counts the bounds as normal', () => {
    expect(statusFor(84.9, [85, 115])).toBe('under');
    expect(statusFor(85, [85, 115])).toBe('normal');
    expect(statusFor(115, [85, 115])).toBe('normal');
    expect(statusFor(115.1, [85, 115])).toBe('over');
  });
});
