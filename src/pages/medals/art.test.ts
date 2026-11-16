import { describe, expect, it } from 'vitest';

import { medalSprite } from './art';
import { MEDAL_CATEGORIES } from './config';
import { MEDAL_RARITIES } from './types';

describe('the medal spritesheets', () => {
  it('assigns a distinct, in-bounds crop to every medal', () => {
    const slots = new Set<string>();
    for (const category of MEDAL_CATEGORIES) {
      for (const rarity of MEDAL_RARITIES) {
        const { sheet, crop } = medalSprite(category, rarity);
        const [x, y, width, height] = crop;
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + width).toBeLessThanOrEqual(sheet.width);
        expect(y + height).toBeLessThanOrEqual(sheet.height);
        slots.add(`${sheet.src} ${crop.join(' ')}`);
      }
    }
    expect(slots.size).toBe(50);
  });
});
