import type { AssessmentDto, Sex } from '../api/types';
import { bodyStandards, SCALES, statusFor } from './standards';

/*
 * "Your plan": what a member should do next, read from their latest scan
 * (and the one before it). Plain rules, ordered by how much they matter for
 * health: belly fat first, then body fat and muscle against the healthy range
 * for their height and sex, then how things moved since the last scan, then
 * what is already going well.
 */

/** act: fix this first. watch: keep an eye on it. keep: going well, carry on. */
export type AdviceLevel = 'act' | 'watch' | 'keep';

export type AdviceKey =
  | 'visceralHigh'
  | 'fatHigh'
  | 'muscleLow'
  | 'fatRising'
  | 'muscleDropping'
  | 'fatLow'
  | 'waterLow'
  | 'muscleStrong'
  | 'fatHealthy';

export type AdviceMetric = 'visceral' | 'fat' | 'muscle' | 'water';

export interface Advice {
  key: AdviceKey;
  level: AdviceLevel;
  metric: AdviceMetric;
  /** Numbers for the copy (formatted by the screen): body fat %, kg, limits. */
  params: Record<string, number>;
}

/** Belly fat (visceral level) at or above this needs action. */
export const VISCERAL_LIMIT = 10;
/** Smallest fat-mass rise (kg) since the last scan that counts as real. */
export const FAT_RISE_KG = 0.3;
/** Smallest muscle drop (kg) since the last scan that counts as real. */
export const MUSCLE_DROP_KG = 0.2;

const ORDER: Record<AdviceLevel, number> = { act: 0, watch: 1, keep: 2 };
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * The member's plan from `scan`, most important first. `before` is the scan
 * before it (null for a first scan). Every scan gets at least one item: when
 * nothing needs work, the "keep" items say what is going well.
 */
export function adviceFor(scan: AssessmentDto, before: AssessmentDto | null, sex: Sex, heightCm: number): Advice[] {
  const out: Advice[] = [];
  const std = bodyStandards(heightCm, sex);
  const pbf = sex === 'MALE' ? SCALES.pbfMale : SCALES.pbfFemale;
  const [fatMin, fatMax] = pbf.normal;
  const smmMin = (std.smmKg * SCALES.smm.normal[0]) / 100;

  if (Number.isFinite(scan.visceralFatLevel) && scan.visceralFatLevel >= VISCERAL_LIMIT)
    out.push({
      key: 'visceralHigh',
      level: 'act',
      metric: 'visceral',
      params: { level: scan.visceralFatLevel, limit: VISCERAL_LIMIT },
    });

  const fatStatus = Number.isFinite(scan.bodyFatPct) ? statusFor(scan.bodyFatPct, pbf.normal) : null;
  if (fatStatus === 'over')
    out.push({ key: 'fatHigh', level: 'act', metric: 'fat', params: { pct: scan.bodyFatPct, max: fatMax } });

  const muscleStatus = Number.isFinite(scan.skeletalMuscleKg)
    ? statusFor((scan.skeletalMuscleKg / std.smmKg) * 100, SCALES.smm.normal)
    : null;
  if (muscleStatus === 'under')
    out.push({
      key: 'muscleLow',
      level: 'act',
      metric: 'muscle',
      params: { kg: scan.skeletalMuscleKg, min: round1(smmMin) },
    });

  if (before) {
    const fatDiff = round1(scan.bodyFatKg - before.bodyFatKg);
    if (Number.isFinite(fatDiff) && fatDiff >= FAT_RISE_KG)
      out.push({ key: 'fatRising', level: 'watch', metric: 'fat', params: { kg: fatDiff } });
    const muscleDiff = round1(before.skeletalMuscleKg - scan.skeletalMuscleKg);
    if (Number.isFinite(muscleDiff) && muscleDiff >= MUSCLE_DROP_KG)
      out.push({ key: 'muscleDropping', level: 'watch', metric: 'muscle', params: { kg: muscleDiff } });
  }

  if (fatStatus === 'under')
    out.push({ key: 'fatLow', level: 'watch', metric: 'fat', params: { pct: scan.bodyFatPct, min: fatMin } });

  if (
    Number.isFinite(scan.totalBodyWaterKg) &&
    statusFor((scan.totalBodyWaterKg / std.waterKg) * 100, SCALES.smm.normal) === 'under'
  )
    out.push({ key: 'waterLow', level: 'watch', metric: 'water', params: { kg: scan.totalBodyWaterKg } });

  if (muscleStatus === 'normal' || muscleStatus === 'over')
    out.push({ key: 'muscleStrong', level: 'keep', metric: 'muscle', params: { kg: scan.skeletalMuscleKg } });
  if (fatStatus === 'normal')
    out.push({ key: 'fatHealthy', level: 'keep', metric: 'fat', params: { pct: scan.bodyFatPct } });

  return out.sort((a, b) => ORDER[a.level] - ORDER[b.level]);
}
