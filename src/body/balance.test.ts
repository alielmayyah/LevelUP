import { describe, expect, it } from 'vitest';

import { BALANCED_GAP_PCT, sideGap } from './balance';

describe('sideGap', () => {
  it('is the left/right difference as a % of their mean', () => {
    // The InBody example: arms 3.48 vs 3.44 kg, legs 9.62 vs 9.58 kg.
    expect(sideGap(3.48, 3.44)).toBeCloseTo(1.16, 2);
    expect(sideGap(9.62, 9.58)).toBeCloseTo(0.42, 2);
    expect(sideGap(3.44, 3.48)).toBeCloseTo(sideGap(3.48, 3.44), 10);
  });

  it('counts up to 2% as balanced', () => {
    expect(BALANCED_GAP_PCT).toBe(2);
  });
});
