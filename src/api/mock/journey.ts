/*
 * Mock copy of the API's journey rules (docs/redesign/PLAN.md, decisions 11–12;
 * ui-standards → Data on screen). The app never re-derives these; it renders
 * what /me/dashboard returns.
 */
import type { AssessmentDto, ChangeVerdict, JourneyDto, JourneyVerdict, MetricChange, ScanChange } from '../types';
import { round1 } from './domain';

/** Smallest change worth calling real between two same-machine scans (InBody 770 test-retest). */
export const NOISE = { muscleKg: 0.9, fatKg: 1.5, weightKg: 1.9, fatPct: 1.9 } as const;

const DAY = 86_400_000;
export const RESCAN_DAYS = 28;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The machine a scan was taken on, or null for older scans that don't say (treated as the same machine). */
const machineOf = (a: AssessmentDto): string | null => {
  const d = a.origin?.device;
  return d ? `${d.brand} ${d.model}` : null;
};

const sameMachine = (a: AssessmentDto, b: AssessmentDto): boolean => {
  const x = machineOf(a);
  const y = machineOf(b);
  return x === null || y === null || x === y;
};

/** `up` says whether a rise is good news for this metric (weight: neither, so it's never better or worse). */
function metric(delta: number, noise: number, up: boolean | null, same: boolean): MetricChange {
  let verdict: ChangeVerdict = 'same';
  if (same && up !== null && Math.abs(delta) >= noise) verdict = delta > 0 === up ? 'better' : 'worse';
  return { delta: round2(delta), verdict };
}

export function scanChange(from: AssessmentDto, to: AssessmentDto): ScanChange {
  const same = sameMachine(from, to);
  return {
    fromAt: from.takenAt,
    toAt: to.takenAt,
    sameMachine: same,
    muscleKg: metric(to.skeletalMuscleKg - from.skeletalMuscleKg, NOISE.muscleKg, true, same),
    fatKg: metric(to.bodyFatKg - from.bodyFatKg, NOISE.fatKg, false, same),
    weightKg: metric(to.weightKg - from.weightKg, NOISE.weightKg, null, same),
    fatPct: metric(to.bodyFatPct - from.bodyFatPct, NOISE.fatPct, false, same),
  };
}

/** 1 + one level per real muscle gain or fat loss since the first scan (same machine only). */
function levelAt(first: AssessmentDto, at: AssessmentDto): number {
  if (!sameMachine(first, at)) return 1;
  const muscle = Math.max(0, at.skeletalMuscleKg - first.skeletalMuscleKg);
  const fat = Math.max(0, first.bodyFatKg - at.bodyFatKg);
  // Tiny epsilon so 2 × 0.9 = 1.8 counts as two levels despite float rounding.
  return 1 + Math.floor(muscle / NOISE.muscleKg + 1e-9) + Math.floor(fat / NOISE.fatKg + 1e-9);
}

function verdictFor(scans: AssessmentDto[], change: ScanChange | null): JourneyVerdict {
  if (scans.length === 0) return 'noScans';
  if (!change) return 'firstScan';
  if (!change.sameMachine) return 'differentMachine';
  const m = change.muscleKg.verdict;
  const f = change.fatKg.verdict;
  if (m === 'better' && f === 'better') return 'recomposition';
  if (m === 'worse') return 'muscleLoss';
  if (f === 'worse') return 'fatGain';
  if (m === 'better') return 'muscleGain';
  if (f === 'better') return 'fatLoss';
  return 'steady';
}

/** Oldest first in, the Home journey out. */
export function journeyFor(scans: AssessmentDto[]): JourneyDto {
  if (scans.length === 0) {
    return {
      noise: { ...NOISE },
      level: 0,
      nextLevel: null,
      verdict: 'noScans',
      stops: [],
      sinceFirst: null,
      sinceLast: null,
      latest: null,
      nextScanDue: null,
      milestone: null,
    };
  }
  const first = scans[0];
  const last = scans[scans.length - 1];
  const prev = scans.length > 1 ? scans[scans.length - 2] : null;
  const sinceFirst = scans.length > 1 ? scanChange(first, last) : null;

  // Levels never go down: the highest level any scan reached.
  const levels = scans.map((s) => levelAt(first, s));
  const level = Math.max(...levels);
  const levelBefore = scans.length > 1 ? Math.max(...levels.slice(0, -1)) : 0;

  const gained = Math.max(0, last.skeletalMuscleKg - first.skeletalMuscleKg);
  const lost = Math.max(0, first.bodyFatKg - last.bodyFatKg);
  const toNext = (done: number, step: number) => round1(step - ((done + 1e-9) % step) || step);

  return {
    noise: { ...NOISE },
    level,
    nextLevel: { muscleKg: toNext(gained, NOISE.muscleKg), fatKg: toNext(lost, NOISE.fatKg) },
    verdict: verdictFor(scans, sinceFirst),
    stops: scans.map((s) => ({ id: s.id, takenAt: s.takenAt, sameMachine: sameMachine(first, s) })),
    sinceFirst,
    sinceLast: prev ? scanChange(prev, last) : null,
    latest: {
      takenAt: last.takenAt,
      weightKg: last.weightKg,
      fatKg: last.bodyFatKg,
      fatFreeMassKg: round2(last.extra?.fatFreeMassKg ?? last.weightKg - last.bodyFatKg),
      place: last.origin?.place ? [last.origin.place.name, last.origin.place.branch].filter(Boolean).join(' · ') : null,
      machine: machineOf(last),
    },
    nextScanDue: new Date(new Date(last.takenAt).getTime() + RESCAN_DAYS * DAY).toISOString(),
    milestone:
      scans.length === 1 ? { key: 'firstScan', level: 1 } : level > levelBefore ? { key: 'levelUp', level } : null,
  };
}
