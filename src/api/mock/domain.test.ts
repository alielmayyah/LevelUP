import { describe, expect, it } from 'vitest';

import { bodyFatPctForScore, computeFitScore, fitScoreTier } from './domain';

// Standards for a 178 cm man: weight 22 × 1.78² = 69.70 kg, of which 15% fat.
const STD_WEIGHT = 22 * 1.78 * 1.78;
const STD_FAT = STD_WEIGHT * 0.15;
const STD_LEAN = STD_WEIGHT - STD_FAT;

describe('FitScore (InBody Score method)', () => {
  it('matches a real InBody sheet: 180 cm man, 78.4 kg, 8.7 kg fat → 89', () => {
    expect(computeFitScore({ weightKg: 78.4, bodyFatKg: 8.7, heightCm: 180, sex: 'MALE' })).toBe(89);
  });

  it('fat below the standard earns no extra points', () => {
    const lean = STD_LEAN;
    const atStandard = computeFitScore({ weightKg: lean + STD_FAT, bodyFatKg: STD_FAT, heightCm: 178, sex: 'MALE' });
    const leaner = computeFitScore({
      weightKg: lean + STD_FAT - 3,
      bodyFatKg: STD_FAT - 3,
      heightCm: 178,
      sex: 'MALE',
    });
    expect(leaner).toBe(atStandard);
  });

  it('a body exactly at the standard scores the 80 baseline', () => {
    expect(computeFitScore({ weightKg: STD_WEIGHT, bodyFatKg: STD_FAT, heightCm: 178, sex: 'MALE' })).toBe(80);
  });

  it('reproduces a real InBody sheet: Fat Control −10.0 kg, Muscle Control +3.8 kg → 66', () => {
    // 10 kg more fat than standard and 3.8 kg less lean mass: 80 − 10 − 3.8 = 66.2.
    const bodyFatKg = STD_FAT + 10;
    const weightKg = STD_LEAN - 3.8 + bodyFatKg;
    expect(computeFitScore({ weightKg, bodyFatKg, heightCm: 178, sex: 'MALE' })).toBe(66);
  });

  it('each kg of extra lean mass adds a point; each kg of extra fat takes one away', () => {
    const base = { heightCm: 178, sex: 'MALE' as const };
    expect(computeFitScore({ ...base, weightKg: STD_WEIGHT + 5, bodyFatKg: STD_FAT })).toBe(85);
    expect(computeFitScore({ ...base, weightKg: STD_WEIGHT + 5, bodyFatKg: STD_FAT + 5 })).toBe(75);
  });

  it('uses the women’s standards (BMI 21.5, 23% fat)', () => {
    const w = 21.5 * 1.65 * 1.65;
    expect(computeFitScore({ weightKg: w, bodyFatKg: w * 0.23, heightCm: 165, sex: 'FEMALE' })).toBe(80);
    // The same body judged on the men's standards scores lower: more fat than a man's ideal.
    expect(computeFitScore({ weightKg: w, bodyFatKg: w * 0.23, heightCm: 165, sex: 'MALE' })).toBeLessThan(80);
  });

  it('stays within 0–100', () => {
    expect(computeFitScore({ weightKg: 140, bodyFatKg: 10, heightCm: 170, sex: 'MALE' })).toBe(100);
    expect(computeFitScore({ weightKg: 160, bodyFatKg: 110, heightCm: 170, sex: 'MALE' })).toBe(0);
  });

  it("a 178 cm member's six scans climb from 72 to 79 as fat drops and muscle grows", () => {
    const scans = [
      [86.0, 26.0],
      [85.2, 25.1],
      [84.5, 24.3],
      [83.9, 23.4],
      [83.3, 22.4],
      [82.6, 21.2],
    ];
    const scores = scans.map(([w, pct]) =>
      computeFitScore({ weightKg: w, bodyFatKg: Math.round(w * pct * 10) / 1000, heightCm: 178, sex: 'MALE' }),
    );
    expect(scores).toEqual([72, 74, 75, 76, 77, 79]);
  });

  it('bodyFatPctForScore inverts the formula (for building mock members)', () => {
    for (const score of [40, 66, 80, 92]) {
      const pct = bodyFatPctForScore(score, 80, 176, 'MALE');
      const bodyFatKg = Math.round(80 * pct * 10) / 1000;
      expect(
        Math.abs(computeFitScore({ weightKg: 80, bodyFatKg, heightCm: 176, sex: 'MALE' }) - score),
      ).toBeLessThanOrEqual(1);
    }
  });

  it('tiers follow InBody’s bands', () => {
    expect([95, 80, 79, 70, 69, 60, 59, 50, 49, 0].map(fitScoreTier)).toEqual([
      'Elite',
      'Elite',
      'Strong',
      'Strong',
      'On Track',
      'On Track',
      'Building',
      'Building',
      'Needs Improvement',
      'Needs Improvement',
    ]);
  });
});
