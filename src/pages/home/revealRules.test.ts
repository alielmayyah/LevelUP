import { describe, expect, it } from 'vitest';

import { journeyFor } from '../../api/mock/journey';
import { buildMembers } from '../../api/mock/members';
import { earnsReveal, mainChange } from './revealRules';

const NOW = new Date('2026-11-18T12:00:00Z');
const scansOf = (fitId: string) => buildMembers(NOW).find((m) => m.fitId === fitId)!.assessments;

describe('earnsReveal', () => {
  it('a new level plays the reveal, even when the last step alone is inside the noise', () => {
    const j = journeyFor(scansOf('104'));
    expect(j.sinceLast?.muscleKg.verdict).toBe('same');
    expect(earnsReveal(j)).toBe(true);
  });

  it('a flat scan with nothing earned does not', () => {
    const [a, b, c] = scansOf('104');
    const flat = { ...c, id: 99, takenAt: new Date(NOW.getTime() + 86_400_000).toISOString() };
    expect(earnsReveal(journeyFor([a, b, c, flat]))).toBe(false);
  });

  it('a scan on another machine never plays it on its own', () => {
    const [a, b] = scansOf('104');
    const other = { ...b, origin: { ...b.origin!, device: { id: 9, brand: 'InBody', model: '270' } } };
    const j = { ...journeyFor([a, other]), milestone: null };
    expect(earnsReveal(j)).toBe(false);
  });
});

describe('mainChange', () => {
  it('picks the change that cleared its noise floor by the most', () => {
    // Fat −2.28 kg is 1.5 floors; muscle +1.0 kg is 1.1 floors.
    expect(mainChange(journeyFor(scansOf('104')))?.metric).toBe('fatKg');
  });

  it('is null with one scan', () => {
    expect(mainChange(journeyFor(scansOf('103')))).toBeNull();
  });
});
