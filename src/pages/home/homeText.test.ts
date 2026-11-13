import { afterEach, describe, expect, it } from 'vitest';

import { setLanguage } from '../../i18n';
import { formatTimeAgo, formatToday, greetingPart, tierKey } from './homeText';

describe('home text helpers', () => {
  afterEach(async () => {
    await setLanguage('en');
  });

  it('greets by the device hour', () => {
    expect(greetingPart(5)).toBe('morning');
    expect(greetingPart(11)).toBe('morning');
    expect(greetingPart(12)).toBe('afternoon');
    expect(greetingPart(16)).toBe('afternoon');
    expect(greetingPart(17)).toBe('evening');
    expect(greetingPart(21)).toBe('evening');
    expect(greetingPart(22)).toBe('late');
    expect(greetingPart(4)).toBe('late');
  });

  it('maps tiers to keys', () => {
    expect(tierKey('On Track')).toBe('home.tier.onTrack');
    expect(tierKey('Needs Improvement')).toBe('home.tier.needsImprovement');
  });

  it("writes today's date in the app language with Latin digits", async () => {
    const d = new Date(2026, 10, 13);
    expect(formatToday(d)).toBe('Friday, November 13');
    await setLanguage('ar');
    expect(formatToday(d)).toMatch(/13/);
    expect(formatToday(d)).toMatch(/نوفمبر/);
  });

  it('says how long ago something happened', () => {
    const now = new Date('2026-11-13T12:00:00Z');
    expect(formatTimeAgo('2026-11-13T10:00:00Z', now)).toBe('2 hours ago');
    expect(formatTimeAgo('2026-11-12T12:00:00Z', now)).toBe('yesterday');
    expect(formatTimeAgo('2026-11-13T11:59:50Z', now)).toBe('this minute');
  });
});
