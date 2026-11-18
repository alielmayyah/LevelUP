import { describe, expect, it } from 'vitest';

import { scanInsight } from './insight';

const r = (skeletalMuscleKg: number, bodyFatKg: number) => ({ skeletalMuscleKg, bodyFatKg });

describe('scanInsight', () => {
  it.each([
    [r(41, 7), 'recomp', 'good'],
    [r(41, 8), 'leanGain', 'good'],
    [r(40, 7), 'fatLoss', 'good'],
    [r(41, 9), 'bulk', 'neutral'],
    [r(39, 7), 'cutting', 'neutral'],
    [r(40, 9), 'fatGain', 'watch'],
    [r(39, 9), 'fatGain', 'watch'],
    [r(39, 8), 'muscleLoss', 'watch'],
    [r(40, 8), 'steady', 'neutral'],
  ])('reads %o against 40 kg muscle / 8 kg fat as %s', (scan, kind, tone) => {
    expect(scanInsight(scan, r(40, 8))).toMatchObject({ kind, tone });
  });

  it('treats small swings as no change', () => {
    expect(scanInsight(r(40.1, 8.2), r(40, 8))?.kind).toBe('steady');
    expect(scanInsight(r(40.2, 7.7), r(40, 8))?.kind).toBe('recomp');
  });

  it('rounds the changes to 0.1 kg', () => {
    expect(scanInsight(r(41.26, 7.04), r(40, 8))).toMatchObject({ muscleKg: 1.3, fatKg: -1 });
  });

  it('returns null when a reading is missing', () => {
    expect(scanInsight(r(Number.NaN, 8), r(40, 8))).toBeNull();
  });
});
