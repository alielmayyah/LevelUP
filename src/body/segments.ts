import type { AssessmentDto, BodySegment, SegmentReading } from '../api/types';

export type SegmentKind = 'lean' | 'fat';

/**
 * A scan's body-part readings of one kind, or null when the machine didn't
 * report them. Reads the separate `segmentalLean` / `segmentalFat` fields
 * first (a lean-only sheet fills just one), then the legacy `segments` pair.
 */
export function segmentReadings(
  scan: AssessmentDto | null | undefined,
  kind: SegmentKind,
): Record<BodySegment, SegmentReading> | null {
  if (!scan) return null;
  const own = kind === 'lean' ? scan.segmentalLean : scan.segmentalFat;
  return own ?? scan.segments?.[kind] ?? null;
}

/** The kinds a scan has readings for, lean first. */
export const segmentKinds = (scan: AssessmentDto): SegmentKind[] =>
  (['lean', 'fat'] as const).filter((k) => segmentReadings(scan, k) !== null);
