/*
 * Karim's scans: the InBody 770 example in docs/inbody/inbody-data-example.json
 * as the latest scan, with the four errors found in discovery fixed
 * (docs/redesign/research/inbody-data-map.md §5), plus the two earlier scans
 * the redesign mockups use (docs/redesign/directions/round-1/BRIEF.md, "Data").
 *
 * Fixes against the example file:
 *   - BMR 1730, not 1745 (Cunningham: 370 + 21.6 × fat-free mass).
 *   - InBody Score 79, not 83 (the app's FitScore method; see domain.ts).
 *   - The water, protein, mineral and fat-free bands fitted a 180 cm man. They
 *     are scaled to 178.5 cm by height² (an estimate until a real export), and
 *     the fat band is InBody's 80–160% of standard fat.
 *   - The time is the machine's local time in Cairo (08:00), not UTC.
 *
 * All three scans are on the same InBody 770 at Iron Box, so they compare fully.
 * The example has lean mass by body part only, so `segments` is null and
 * `segmentalLean` carries it: the lean-only case the body map must handle.
 */
import type { AssessmentDto, BodySegment, NormalRange, RangedKey, ScanOrigin, SegmentReading } from '../types';
import { computeFitScore, round1 } from './domain';

export const KARIM_HEIGHT_CM = 178.5;

const HEIGHT_FIX = (KARIM_HEIGHT_CM / 180) ** 2;
const scaled = (low: number, high: number, digits = 1): NormalRange => {
  const f = 10 ** digits;
  return { low: Math.round(low * HEIGHT_FIX * f) / f, high: Math.round(high * HEIGHT_FIX * f) / f };
};

/** The bands the example sheet prints, corrected as described above. Same machine, so the same bands on every scan. */
export const KARIM_RANGES: Partial<Record<RangedKey, NormalRange>> = {
  skeletalMuscleKg: { low: 29.8, high: 36.4 },
  bodyFatKg: { low: 8.4, high: 16.8 },
  bodyFatPct: { low: 10, high: 20 },
  fatFreeMassKg: scaled(54.4, 66.6),
  totalBodyWaterKg: scaled(40.0, 49.0),
  proteinKg: scaled(10.7, 13.1),
  mineralsKg: scaled(3.7, 4.52, 2),
  ecwRatio: { low: 0.36, high: 0.39 },
};

export const IRON_BOX_770: ScanOrigin = {
  source: 'csv',
  trust: 'verified',
  device: { id: 1, brand: 'InBody', model: '770' },
  place: { orgId: 1, name: 'Iron Box', branch: 'New Cairo' },
  conditions: { fasted: true, trainedBefore: false },
  sheetImageUrl: null,
};

/** Lean mass by body part on the latest scan, kg and % of ideal, straight from the example. */
const LATEST_LEAN: Record<BodySegment, SegmentReading> = {
  rightArm: { kg: 3.48, pct: 105.4 },
  leftArm: { kg: 3.44, pct: 104.2 },
  trunk: { kg: 28.4, pct: 102.1 },
  rightLeg: { kg: 9.62, pct: 103.5 },
  leftLeg: { kg: 9.58, pct: 103.1 },
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Earlier scans: the latest body-part split scaled by fat-free mass (the example has only one scan). */
function leanScaledTo(fatFreeMassKg: number): Record<BodySegment, SegmentReading> {
  const k = fatFreeMassKg / 62.98;
  const out = {} as Record<BodySegment, SegmentReading>;
  for (const [seg, r] of Object.entries(LATEST_LEAN) as [BodySegment, SegmentReading][]) {
    out[seg] = { kg: round2(r.kg * k), pct: round1(r.pct * k) };
  }
  return out;
}

export interface KarimScanInput {
  id: number;
  takenAt: Date;
  weightKg: number;
  skeletalMuscleKg: number;
  bodyFatKg: number;
  bodyFatPct: number;
  visceralFatLevel: number;
}

/** An earlier scan: the brief gives weight, muscle, fat and visceral level; the rest follows fat-free mass the way the latest sheet splits it. */
export function karimEarlierScan(s: KarimScanInput): AssessmentDto {
  const ffm = round2(s.weightKg - s.bodyFatKg);
  const k = ffm / 62.98;
  return {
    id: s.id,
    takenAt: s.takenAt.toISOString(),
    weightKg: s.weightKg,
    skeletalMuscleKg: s.skeletalMuscleKg,
    bodyFatKg: s.bodyFatKg,
    bodyFatPct: s.bodyFatPct,
    bmi: round2(s.weightKg / (KARIM_HEIGHT_CM / 100) ** 2),
    visceralFatLevel: s.visceralFatLevel,
    totalBodyWaterKg: round1(46.4 * k),
    proteinKg: round1(12.4 * k),
    mineralsKg: round2(4.18 * k),
    bmrKcal: Math.round(370 + 21.6 * ffm),
    fitScore: computeFitScore({
      weightKg: s.weightKg,
      bodyFatKg: s.bodyFatKg,
      heightCm: KARIM_HEIGHT_CM,
      sex: 'MALE',
    }),
    segments: null,
    origin: IRON_BOX_770,
    ranges: KARIM_RANGES,
    extra: {
      heightCm: KARIM_HEIGHT_CM,
      fatFreeMassKg: ffm,
      softLeanMassKg: round1(58.8 * k),
      intracellularWaterL: round1(28.9 * k),
      extracellularWaterL: round1(17.5 * k),
      ecwRatio: 0.377,
      visceralFatAreaCm2: null,
      phaseAngleDeg: null,
      segmentPhaseAngleDeg: null,
      deviceScore: null,
    },
    segmentalLean: leanScaledTo(ffm),
    segmentalFat: null,
  };
}

/** The latest scan: the example sheet, corrected. */
export function karimLatestScan(id: number, takenAt: Date): AssessmentDto {
  return {
    id,
    takenAt: takenAt.toISOString(),
    weightKg: 77.9,
    skeletalMuscleKg: 35.8,
    bodyFatKg: 14.92,
    bodyFatPct: 19.15,
    bmi: 24.45,
    visceralFatLevel: 6,
    totalBodyWaterKg: 46.4,
    proteinKg: 12.4,
    mineralsKg: 4.18,
    bmrKcal: 1730,
    fitScore: 79,
    segments: null,
    origin: IRON_BOX_770,
    ranges: KARIM_RANGES,
    extra: {
      heightCm: KARIM_HEIGHT_CM,
      fatFreeMassKg: 62.98,
      softLeanMassKg: 58.8,
      intracellularWaterL: 28.9,
      extracellularWaterL: 17.5,
      ecwRatio: 0.377,
      visceralFatAreaCm2: 64.2,
      phaseAngleDeg: 7.3,
      segmentPhaseAngleDeg: { rightArm: 7.4, leftArm: 7.2, trunk: 7.9, rightLeg: 6.8, leftLeg: 6.7 },
      deviceScore: 79,
    },
    segmentalLean: LATEST_LEAN,
    segmentalFat: null,
  };
}
