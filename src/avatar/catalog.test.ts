import { describe, expect, it } from 'vitest';

import {
  AVATAR_PARTS,
  OUTFIT_IDS,
  STYLE_PARTS,
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
  stylesFor,
  trainingStyles,
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
    expect(starterAvatar('101').colors).toEqual({
      skin: 'medium-brown',
      hair: 'honey-blond',
      eyes: 'brown',
      tank: 'charcoal',
      shorts: 'navy',
      shoes: 'amber',
    });
  });

  it('randomize only returns catalog-valid looks', () => {
    for (let i = 0; i < 200; i++) expect(isValidAvatar(randomAvatar())).toBe(true);
    expect(isValidAvatar(randomAvatar(() => 0.999999))).toBe(true);
    const first = randomAvatar(() => 0);
    const last = randomAvatar(() => 0.999999);
    for (const part of STYLE_PARTS) {
      expect(first.styles?.[part]).toBe(trainingStyles(part)[0]);
      expect(last.styles?.[part]).toBe(trainingStyles(part).at(-1));
    }
  });

  it('offers training gear while keeping casual styles readable for existing saves', () => {
    const legacy = { ...defaultAvatar(), styles: { ...stylesFor(), top: 'varsity', pants: 'jeans', shoes: 'canvas' } };
    expect(isValidAvatar(legacy)).toBe(true);
    expect(stylesFor(legacy.styles)).toMatchObject({ top: 'varsity', pants: 'jeans', shoes: 'canvas' });
    expect(trainingStyles('top', 'varsity')).toContain('varsity');
    expect(trainingStyles('top')).not.toContain('varsity');
    expect(trainingStyles('pants')).not.toContain('jeans');
    expect(trainingStyles('shoes')).not.toContain('canvas');
    for (const id of OUTFIT_IDS) {
      const styles = stylesFor(applyOutfit(defaultAvatar(), id).styles);
      for (const part of ['top', 'pants', 'shoes', 'socks'] as const)
        expect(trainingStyles(part)).toContain(styles[part]);
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
      const { tank, shorts, shoes, socks, ...appearance } = original.colors;
      expect(outfit.colors).toMatchObject(appearance);
      expect(sameAvatar(outfit, applyOutfit(outfit, id))).toBe(true);
      expect(outfit.colors).not.toEqual({ ...appearance, tank, shorts, shoes, socks });
    }
  });

  it('defaults legacy saves to no socks and validates sock choices independently of shoes', () => {
    const legacy = { ...defaultAvatar(), styles: { hair: 'curls', body: 'balanced', top: 'tank', shoes: 'trainers' } };
    expect(isValidAvatar(legacy)).toBe(true);
    expect(stylesFor(legacy.styles).socks).toBe('no-socks');
    const look = { ...defaultAvatar(), styles: { ...stylesFor(), socks: 'striped-socks' as const } };
    const recolored = { ...look, colors: { ...look.colors, socks: 'violet' } };
    expect(isValidAvatar(recolored)).toBe(true);
    expect(isValidAvatar({ ...look, colors: { ...look.colors, socks: 'unknown' } })).toBe(false);
    expect(isValidAvatar({ ...look, styles: { ...look.styles, socks: 'unknown' } })).toBe(false);
    expect(sameAvatar(look, recolored)).toBe(false);
    expect(paintFor(recolored).socks).not.toBe(paintFor(look).socks);
    expect(paintFor(recolored).shoes).toBe(paintFor(look).shoes);
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
    const paint = paintFor(avatar);
    expect(contrastRatio(paint.stubble, paint.skin)).toBeLessThan(contrastRatio(paint.beard, paint.skin));
  });

  it('keeps a visible facial detail across every skin and feature color', () => {
    for (const skin of presetsFor('skin')) {
      const config = defaultAvatar();
      config.colors.skin = skin.id;
      const { mouth } = paintFor(config);
      expect(contrastRatio(mouth, skin.color), skin.id).toBeGreaterThanOrEqual(2.1);
      expect(paintFor({ ...config, colors: { ...config.colors, smile: 'warm-brown' } }).mouth).toBe(mouth);
      for (const feature of presetsFor('eyes')) {
        const { eyes } = paintFor({ ...config, colors: { ...config.colors, eyes: feature.id } });
        if (contrastRatio(feature.color, skin.color) >= 1.9) expect(eyes).toBe(feature.color);
        else expect(contrastRatio(eyes, skin.color), `${skin.id} + eyes ${feature.id}`).toBeGreaterThanOrEqual(1.9);
      }
    }
  });
});
