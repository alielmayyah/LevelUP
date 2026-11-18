import { beforeEach, describe, expect, it } from 'vitest';

import type { AssessmentDto } from '../types';
import { journeyFor, scanChange } from './journey';
import { buildMembers } from './members';

const NOW = new Date('2026-11-18T12:00:00Z');
let byId: Record<string, AssessmentDto[]>;

beforeEach(() => {
  byId = Object.fromEntries(buildMembers(NOW).map((m) => [m.fitId, m.assessments]));
});

describe('journeyFor', () => {
  it('no scans: level 0, nothing to draw', () => {
    const j = journeyFor(byId['102']);
    expect(j).toMatchObject({ level: 0, verdict: 'noScans', stops: [], latest: null, milestone: null });
  });

  it('one scan: level 1, the first-scan milestone, no changes yet', () => {
    const j = journeyFor(byId['103']);
    expect(j).toMatchObject({ level: 1, verdict: 'firstScan', sinceFirst: null, sinceLast: null });
    expect(j.milestone).toEqual({ key: 'firstScan', level: 1 });
    expect(j.nextLevel).toEqual({ muscleKg: 0.9, fatKg: 1.5 });
  });

  it('Karim: a real trend since the first scan, the last change inside the noise, a level-up', () => {
    const j = journeyFor(byId['104']);
    // +1.0 kg muscle and −2.28 kg fat: one real step each, on top of level 1.
    expect(j.level).toBe(3);
    expect(j.verdict).toBe('recomposition');
    expect(j.sinceFirst?.muscleKg).toEqual({ delta: 1, verdict: 'better' });
    expect(j.sinceFirst?.fatKg).toEqual({ delta: -2.28, verdict: 'better' });
    // Weight −1.1 kg is inside its 1.9 kg noise.
    expect(j.sinceFirst?.weightKg.verdict).toBe('same');
    expect(j.sinceLast?.muscleKg.verdict).toBe('same');
    expect(j.sinceLast?.fatKg.verdict).toBe('same');
    expect(j.milestone).toEqual({ key: 'levelUp', level: 3 });
    expect(j.nextLevel).toEqual({ muscleKg: 0.8, fatKg: 0.7 });
    expect(j.latest).toMatchObject({ weightKg: 77.9, fatKg: 14.92, fatFreeMassKg: 62.98 });
    expect(j.latest?.place).toBe('Iron Box · New Cairo');
    expect(j.latest?.machine).toBe('InBody 770');
    expect(j.stops).toHaveLength(3);
    const due = new Date(j.nextScanDue ?? '').getTime() - new Date(j.latest?.takenAt ?? '').getTime();
    expect(due).toBe(28 * 86_400_000);
  });

  it('a different machine gives direction only: no verdict, no level from that scan', () => {
    const [a, b] = byId['104'];
    const other = { ...b, origin: { ...b.origin!, device: { id: 9, brand: 'InBody', model: '270' } } };
    const change = scanChange(a, other);
    expect(change.sameMachine).toBe(false);
    expect(change.muscleKg.verdict).toBe('same');
    expect(journeyFor([a, other]).verdict).toBe('differentMachine');
    expect(journeyFor([a, other]).level).toBe(1);
  });

  it('levels never go down after a loss', () => {
    const scans = byId['104'];
    const worse = { ...scans[2], id: 99, skeletalMuscleKg: 33.5, bodyFatKg: 18.0 };
    const j = journeyFor([...scans, worse]);
    expect(j.level).toBe(3);
    expect(j.verdict).toBe('muscleLoss');
    expect(j.milestone).toBeNull();
  });
});
