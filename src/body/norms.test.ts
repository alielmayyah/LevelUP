import { describe, expect, it } from 'vitest';

import { bodyFatPercentile } from './norms';

describe('bodyFatPercentile', () => {
  it('reads the table at its own points', () => {
    expect(bodyFatPercentile(16.6, 'MALE', 25)).toBe(50);
    expect(bodyFatPercentile(22.1, 'FEMALE', 22)).toBe(50);
    expect(bodyFatPercentile(23.2, 'MALE', 55)).toBe(50);
  });

  it('interpolates between points', () => {
    expect(bodyFatPercentile(15.7, 'MALE', 25)).toBe(55);
  });

  it('uses the age band', () => {
    // 20% fat is average for a man in his 30s, leaner than most in his 60s.
    expect(bodyFatPercentile(19.7, 'MALE', 35)).toBe(50);
    expect(bodyFatPercentile(19.7, 'MALE', 65)).toBe(80);
  });

  it('clamps to 1 to 99', () => {
    expect(bodyFatPercentile(3, 'MALE', 25)).toBe(99);
    expect(bodyFatPercentile(45, 'FEMALE', 25)).toBe(1);
  });

  it('returns null for a missing value', () => {
    expect(bodyFatPercentile(Number.NaN, 'MALE', 25)).toBeNull();
  });
});
