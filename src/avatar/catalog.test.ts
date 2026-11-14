import { describe, expect, it } from 'vitest';

import {
  AVATAR_PARTS,
  OUTFIT_IDS,
  STYLE_PARTS,
  STYLES,
  applyOutfit,
  contrastRatio,
  defaultAvatar,
  isValidAvatar,
  normalizeAvatar,
  paintFor,
  presetsFor,
  randomAvatar,
  sameAvatar,
  starterAvatar,
} from './catalog';

describe('avatar catalog', () => {
  it('default look is valid and reproduces the original art’s shades', () => {
    const d = defaultAvatar();
    expect(isValidAvatar(d)).toBe(true);
    const p = paintFor(d);
    expect(p.skin).toBe('#d47c51');
    expect(p.skinShade).toBe('#bb603f');
    expect(p.hairLight).toBe('#49263e');
    expect(p.hairShade).toBe('#2a1426');
  });

  it('every preset of every part paints a valid hex color', () => {
    for (const part of AVATAR_PARTS) {
      for (const preset of presetsFor(part)) {
        const look = { ...defaultAvatar(), colors: { ...defaultAvatar().colors, [part]: preset.id } };
        for (const fill of Object.values(paintFor(look))) expect(fill).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('a starter is stable per member and differs between members', () => {
    expect(starterAvatar('101')).toEqual(starterAvatar('101'));
    expect(isValidAvatar(starterAvatar('101'))).toBe(true);
    const looks = ['101', '102', '103', '104', '105'].map(starterAvatar);
    expect(new Set(looks.map((l) => JSON.stringify(l))).size).toBeGreaterThan(1);
  });

  it('randomize only returns catalog-valid looks', () => {
    for (let i = 0; i < 200; i++) expect(isValidAvatar(randomAvatar())).toBe(true);
    expect(isValidAvatar(randomAvatar(() => 0.999999))).toBe(true);
    const first = randomAvatar(() => 0);
    const last = randomAvatar(() => 0.999999);
    for (const part of STYLE_PARTS) {
      expect(first.styles?.[part]).toBe(STYLES[part][0]);
      expect(last.styles?.[part]).toBe(STYLES[part].at(-1));
    }
  });

  it('normalize keeps known choices and falls back per part', () => {
    const n = normalizeAvatar({ colors: { hair: 'silver', tank: 'retired-color', skin: 42 } });
    expect(n.colors.hair).toBe('silver');
    expect(n.colors.tank).toBe(defaultAvatar().colors.tank);
    expect(n.colors.skin).toBe(defaultAvatar().colors.skin);
    expect(normalizeAvatar(null)).toEqual(defaultAvatar());
  });

  it('sameAvatar compares choices', () => {
    const a = defaultAvatar();
    expect(sameAvatar(a, defaultAvatar())).toBe(true);
    expect(sameAvatar(a, { ...a, colors: { ...a.colors, hair: 'silver' } })).toBe(false);
    expect(sameAvatar(a, { ...a, styles: { ...a.styles!, top: 'hoodie' } })).toBe(false);
  });

  it('preserves legacy colors and uses the original styles for an older save', () => {
    const { styles, ...legacy } = defaultAvatar();
    legacy.colors.hair = 'silver';
    expect(isValidAvatar(legacy)).toBe(true);
    const loaded = normalizeAvatar(legacy);
    expect(loaded.colors).toEqual(legacy.colors);
    expect(loaded.styles).toEqual(styles);
    expect(sameAvatar(loaded, legacy)).toBe(true);
    expect(normalizeAvatar({ ...legacy, styles: { hair: 'locs', top: 'retired' } }).styles).toEqual({
      ...styles,
      hair: 'locs',
    });
  });

  it('applies valid outfits while preserving hair, face, body, and beard', () => {
    const original = starterAvatar('101');
    original.styles = { hair: 'locs', body: 'broad', top: 'tee', shoes: 'runners', beard: 'goatee' };
    original.colors.beard = 'silver';
    for (const id of OUTFIT_IDS) {
      const outfit = applyOutfit(original, id);
      expect(isValidAvatar(outfit)).toBe(true);
      expect(outfit.styles).toMatchObject({ body: 'broad', hair: 'locs', beard: 'goatee' });
      const { tank, shorts, shoes, ...appearance } = original.colors;
      expect(outfit.colors).toMatchObject(appearance);
      expect(sameAvatar(outfit, applyOutfit(outfit, id))).toBe(true);
      expect(outfit.colors).not.toEqual({ ...appearance, tank, shorts, shoes });
    }
  });

  it('uses the hair palette for beards until an independent color is chosen', () => {
    const avatar = defaultAvatar();
    avatar.colors.hair = 'auburn';
    expect(paintFor(avatar).beard).toBe(paintFor(avatar).hair);
    avatar.colors.beard = 'silver';
    const silver = paintFor(avatar).beard;
    avatar.colors.hair = 'brown';
    expect(paintFor(avatar).beard).toBe(silver);
    expect(paintFor(avatar).beard).not.toBe(paintFor(avatar).hair);
    expect(sameAvatar(avatar, { ...avatar, colors: { ...avatar.colors, beard: 'match-hair' } })).toBe(false);
  });

  it('keeps a visible facial detail across every skin and feature color', () => {
    for (const skin of presetsFor('skin')) {
      for (const part of ['eyes', 'smile'] as const) {
        for (const feature of presetsFor(part)) {
          const config = defaultAvatar();
          config.colors = { ...config.colors, skin: skin.id, [part]: feature.id };
          const paint = paintFor(config);
          const mark = part === 'eyes' ? paint.eyes : paint.mouth;
          const minimum = part === 'eyes' ? 1.9 : 2.1;
          if (contrastRatio(feature.color, paint.skin) >= minimum) expect(mark).toBe(feature.color);
          else
            expect(contrastRatio(mark, paint.skin), `${skin.id} + ${part} ${feature.id}`).toBeGreaterThanOrEqual(
              minimum,
            );
        }
      }
    }
  });
});
