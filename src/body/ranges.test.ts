import { describe, expect, it } from 'vitest';

import type { AssessmentDto } from '../api/types';
import { ATTENTION_SIDE, rangeFor, trackPosition, zoneOf } from './ranges';

const scan = (over: Partial<AssessmentDto> = {}) => ({ weightKg: 80, ...over }) as AssessmentDto;

describe('rangeFor', () => {
  it('uses the band the machine printed when the scan has one', () => {
    const r = rangeFor(scan({ ranges: { bodyFatKg: { low: 8.4, high: 16.8 } } }), 'bodyFatKg', 'MALE', 178.5);
    expect(r).toEqual({ low: 8.4, high: 16.8, source: 'machine' });
  });

  it('falls back to the standard for the member when the machine printed none', () => {
    const r = rangeFor(scan(), 'skeletalMuscleKg', 'MALE', 180);
    expect(r.source).toBe('standard');
    expect(r.low).toBeCloseTo(30.6, 1);
    expect(r.high).toBeCloseTo(37.4, 1);
  });

  it('fat % uses the band for the sex', () => {
    expect(rangeFor(scan(), 'bodyFatPct', 'FEMALE', 165)).toMatchObject({ low: 18, high: 28 });
  });
});

describe('zones and the track', () => {
  it('names the zone and which side needs attention', () => {
    expect(zoneOf(17, { low: 8.4, high: 16.8 })).toBe('over');
    expect(ATTENTION_SIDE.bodyFatKg).toBe('over');
    expect(ATTENTION_SIDE.skeletalMuscleKg).toBe('under');
    expect(ATTENTION_SIDE.weightKg).toBeNull();
  });

  it('puts the band in the middle half of the track and clamps the ends', () => {
    const r = { low: 10, high: 20 };
    expect(trackPosition(10, r)).toBe(0.25);
    expect(trackPosition(20, r)).toBe(0.75);
    expect(trackPosition(-5, r)).toBe(0);
    expect(trackPosition(99, r)).toBe(1);
  });
});
