import type { JourneyDto, MetricChange } from '../../api/types';

/**
 * Whether a new scan earns the reveal (ui-standards → Motion): only a
 * same-machine change beyond the noise, or a new level. A flat scan gets a
 * quiet "on the way" toast instead.
 */
export function earnsReveal(j: JourneyDto): boolean {
  if (j.milestone) return true;
  const last = j.sinceLast;
  if (!last || !last.sameMachine) return false;
  return [last.muscleKg, last.fatKg].some((c) => c.verdict !== 'same');
}

/** The biggest real change since the first scan, measured in noise floors. */
export function mainChange(j: JourneyDto): { metric: 'muscleKg' | 'fatKg'; change: MetricChange } | null {
  const s = j.sinceFirst;
  if (!s) return null;
  const options = [
    { metric: 'muscleKg' as const, change: s.muscleKg, size: Math.abs(s.muscleKg.delta) / j.noise.muscleKg },
    { metric: 'fatKg' as const, change: s.fatKg, size: Math.abs(s.fatKg.delta) / j.noise.fatKg },
  ].filter((o) => o.change.verdict !== 'same');
  options.sort((a, b) => b.size - a.size);
  return options[0] ?? null;
}
