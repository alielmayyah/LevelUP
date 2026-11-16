import { describe, expect, it } from 'vitest';

import { daysBetween, spanOf } from './scanAge';

describe('scanAge', () => {
  it('counts calendar days, not 24-hour blocks', () => {
    expect(daysBetween(new Date(2026, 10, 15, 23, 50), new Date(2026, 10, 16, 0, 10))).toBe(1);
    expect(daysBetween(new Date(2026, 10, 16, 8), new Date(2026, 10, 16, 20))).toBe(0);
    expect(daysBetween(new Date(2026, 10, 16), new Date(2026, 9, 15))).toBe(-32);
  });

  it('picks the biggest whole unit', () => {
    expect(spanOf(0)).toBeNull();
    expect(spanOf(3)).toEqual({ unit: 'day', count: 3 });
    expect(spanOf(-9)).toEqual({ unit: 'week', count: 1 });
    expect(spanOf(29)).toEqual({ unit: 'week', count: 4 });
    expect(spanOf(32)).toEqual({ unit: 'month', count: 1 });
    expect(spanOf(400)).toEqual({ unit: 'year', count: 1 });
  });
});
