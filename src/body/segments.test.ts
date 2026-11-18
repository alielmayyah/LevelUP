import { describe, expect, it } from 'vitest';

import type { AssessmentDto, BodySegment, SegmentReading } from '../api/types';
import { segmentKinds, segmentReadings } from './segments';

const part = (kg: number): Record<BodySegment, SegmentReading> => ({
  leftArm: { kg, pct: 100 },
  rightArm: { kg, pct: 100 },
  trunk: { kg, pct: 100 },
  leftLeg: { kg, pct: 100 },
  rightLeg: { kg, pct: 100 },
});

const scan = (over: Partial<AssessmentDto>): AssessmentDto => ({ segments: null, ...over }) as AssessmentDto;

describe('segmentReadings', () => {
  it('reads the legacy pair when the new fields are missing', () => {
    const s = scan({ segments: { lean: part(3), fat: part(1) } });
    expect(segmentReadings(s, 'lean')?.trunk.kg).toBe(3);
    expect(segmentReadings(s, 'fat')?.trunk.kg).toBe(1);
    expect(segmentKinds(s)).toEqual(['lean', 'fat']);
  });

  it('prefers the separate fields, and a lean-only scan has only the lean kind', () => {
    const s = scan({ segmentalLean: part(4), segmentalFat: null });
    expect(segmentReadings(s, 'lean')?.trunk.kg).toBe(4);
    expect(segmentReadings(s, 'fat')).toBeNull();
    expect(segmentKinds(s)).toEqual(['lean']);
  });

  it('is null with no scan or no readings', () => {
    expect(segmentReadings(null, 'lean')).toBeNull();
    expect(segmentKinds(scan({}))).toEqual([]);
  });
});
