import { describe, expect, it } from 'vitest';

import {
  AVATAR_PARTS,
  STYLE_PARTS,
  applyCharacterPreset,
  applyOutfit,
  characterPresetsFor,
  contrastRatio,
  customizerTabsFor,
  defaultAvatar,
  isHijab,
  isValidAvatar,
  memberAvatar,
  normalizeAvatar,
  outfitsFor,
  paintFor,
  presetsFor,
  randomAvatar,
  removeHijab,
  sameAvatar,
  showsLowerLeg,
  stylesFor,
  trainingStyles,
  withHair,
} from './catalog';

describe('avatar catalog', () => {
  const starterAvatar = (memberId: number) => memberAvatar({ memberId, sex: 'MALE', avatar: null });

  it('reference presets apply valid art colors and preserve the member’s chosen build', () => {
    for (const rig of ['standard', 'women'] as const) {
      const base = { ...defaultAvatar(), rig, styles: { ...stylesFor(), body: 'stocky' as const } };
      const looks = characterPresetsFor(rig).map((id) => applyCharacterPreset(base, id));
      expect(new Set(looks.map((look) => JSON.stringify(look))).size).toBe(looks.length);
      for (const look of looks) {
        expect(isValidAvatar(look)).toBe(true);
        expect(look.styles?.body).toBe('stocky');
        expect(look.colors).toMatchObject({ skin: 'light', eyes: 'dark-brown' });
        expect(normalizeAvatar(look)).toEqual(look);
      }
    }
  });

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
    expect(starterAvatar(101)).toEqual(starterAvatar(101));
    expect(isValidAvatar(starterAvatar(101))).toBe(true);
    const looks = [101, 102, 103, 104, 105].map(starterAvatar);
    expect(new Set(looks.map((l) => JSON.stringify(l))).size).toBeGreaterThan(1);
    expect(starterAvatar(101).colors).toEqual({
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
      expect(first.styles?.[part]).toBe(trainingStyles(part, 'standard')[0]);
      expect(last.styles?.[part]).toBe(trainingStyles(part, 'standard').at(-1));
    }
  });

  it('offers training gear while keeping casual styles readable for existing saves', () => {
    const legacy = { ...defaultAvatar(), styles: { ...stylesFor(), top: 'varsity', pants: 'jeans', shoes: 'canvas' } };
    expect(isValidAvatar(legacy)).toBe(true);
    expect(stylesFor(legacy.styles)).toMatchObject({ top: 'varsity', pants: 'jeans', shoes: 'canvas' });
    expect(trainingStyles('top', 'standard', 'varsity')).toContain('varsity');
    expect(trainingStyles('top', 'standard')).not.toContain('varsity');
    expect(trainingStyles('pants', 'standard')).not.toContain('jeans');
    expect(trainingStyles('shoes', 'standard')).not.toContain('canvas');
    for (const rig of ['standard', 'women'] as const) {
      for (const id of outfitsFor(rig)) {
        const styles = stylesFor(applyOutfit({ ...defaultAvatar(), rig }, id).styles);
        for (const part of ['top', 'pants', 'shoes', 'socks'] as const)
          expect(trainingStyles(part, rig)).toContain(styles[part]);
      }
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

  it('selects a women’s base with a ponytail and keeps the chosen skin tone, body and kit', () => {
    const original = applyOutfit(defaultAvatar(), 'strength-day');
    original.styles = { ...stylesFor(original.styles), body: 'stocky' };
    const women = memberAvatar({ memberId: 102, sex: 'FEMALE', avatar: original });
    expect(isValidAvatar(women)).toBe(true);
    expect(isValidAvatar({ ...women, rig: 'unknown' })).toBe(false);
    expect(women.styles).toMatchObject({ hair: 'high-ponytail', body: 'stocky', top: 'sleeveless-hoodie' });
    expect(women.colors).toEqual(original.colors);
    expect(sameAvatar({ ...women, rig: 'standard' }, women)).toBe(false);
    const pilates = applyOutfit(women, 'pilates-studio');
    expect(normalizeAvatar(pilates)).toEqual(pilates);
    expect(pilates.styles).toMatchObject({ hair: 'high-ponytail', top: 'racerback-bra', pants: 'high-rise-leggings' });
    expect(randomAvatar(() => 0.9, 'women')).toMatchObject({ rig: 'women', styles: { beard: 'clean-shaven' } });
  });

  it('uses the account catalog for saved and randomized looks', () => {
    const women = memberAvatar({ memberId: 102, sex: 'FEMALE', avatar: null });
    const hijab = applyOutfit(women, 'hijab-training');
    expect(outfitsFor('women')[0]).toBe('hijab-training');
    expect(outfitsFor('standard')).not.toContain('hijab-training');
    expect(outfitsFor('standard')).not.toContain('hijab-tank');
    expect(applyOutfit(women, 'hijab-tank').styles).toMatchObject({ hair: 'sport-hijab', top: 'longline-tank' });
    expect(applyOutfit(defaultAvatar(), 'hijab-tank')).toEqual(defaultAvatar());
    expect(applyCharacterPreset(defaultAvatar(), 'lilac-hijab')).toEqual(defaultAvatar());
    expect(withHair(defaultAvatar(), 'sport-hijab')).toEqual(defaultAvatar());
    expect(customizerTabsFor('women')).not.toContain('beard');
    expect(trainingStyles('hair', 'standard', 'sport-hijab')).not.toContain('sport-hijab');
    expect(trainingStyles('hair', 'women')).not.toContain('fade');
    expect(isValidAvatar(hijab)).toBe(true);
    const legacyMale = { ...hijab, rig: 'standard', hairUnderHijab: 'waves' } as const;
    expect(memberAvatar({ memberId: 101, sex: 'MALE', avatar: legacyMale })).toMatchObject({
      styles: { hair: 'waves', pants: 'track-pants' },
      colors: hijab.colors,
    });
    expect(normalizeAvatar(hijab)).toEqual(hijab);
    expect(isValidAvatar({ ...hijab, colors: { ...hijab.colors, hijab: 'unknown' } })).toBe(false);
    const sage = { ...hijab, colors: { ...hijab.colors, hijab: 'sage' } };
    expect(sameAvatar(sage, hijab)).toBe(false);
    expect(paintFor(sage).hair).toBe(paintFor(hijab).hair);
    expect(paintFor(sage).hijab).not.toBe(paintFor(hijab).hijab);
    expect(memberAvatar({ memberId: 101, sex: 'MALE', avatar: hijab })).toMatchObject({
      rig: 'standard',
      styles: { hair: 'curls', top: 'tee' },
    });
    for (const rig of ['standard', 'women'] as const) {
      for (const roll of [0, 0.25, 0.5, 0.75, 0.99]) {
        const styles = stylesFor(randomAvatar(() => roll, rig).styles);
        for (const part of STYLE_PARTS) expect(trainingStyles(part, rig)).toContain(styles[part]);
      }
    }
  });

  it('keeps the underlying hairstyle through hijab changes, randomization and storage', () => {
    const women = memberAvatar({ memberId: 102, sex: 'FEMALE', avatar: null });
    const braided = withHair(women, 'double-braids');
    const covered = applyOutfit(braided, 'covered-cardio');
    const long = withHair(covered, 'longline-hijab');
    expect(isValidAvatar(long)).toBe(true);
    expect(isValidAvatar({ ...long, hairUnderHijab: 'wrap-hijab' })).toBe(false);
    expect(removeHijab(normalizeAvatar(long))).toMatchObject({ styles: { hair: 'double-braids' } });
    expect(removeHijab(long)).not.toHaveProperty('hairUnderHijab');
    expect(trainingStyles('hair', 'standard').some(isHijab)).toBe(false);
    expect(trainingStyles('pants', 'standard')).not.toContain('cargo');
    const legacy = { ...women, styles: { ...stylesFor(women.styles), hair: 'sport-hijab' } } as const;
    expect(removeHijab(legacy).styles?.hair).toBe('high-ponytail');
    for (const roll of [0, 0.25, 0.5, 0.75, 0.99]) {
      const mixed = randomAvatar(() => roll, 'women', long);
      const styles = stylesFor(mixed.styles);
      expect(styles.hair).toBe('longline-hijab');
      expect(trainingStyles('top', 'women')).toContain(styles.top);
      expect(showsLowerLeg(styles.pants)).toBe(false);
      expect(mixed.colors.hijab).toBe(long.colors.hijab);
      expect(removeHijab(mixed).colors.hair).toBe(braided.colors.hair);
    }
    expect(randomAvatar(() => 0, 'women', long).styles).toMatchObject({ hair: 'longline-hijab', top: 'tank' });
  });

  it('defaults older saves to no glasses and keeps frames independent of outfits and expressions', () => {
    for (const rig of ['standard', 'women'] as const) {
      const legacy = {
        ...defaultAvatar(),
        rig,
        styles: { hair: 'curls', body: 'balanced', top: 'tank', shoes: 'trainers' },
      } as const;
      const base = normalizeAvatar(legacy);
      const styles = stylesFor(base.styles);
      expect(isValidAvatar(legacy)).toBe(true);
      expect(styles.glasses).toBe('no-glasses');
      expect(sameAvatar(base, legacy)).toBe(true);

      for (const glasses of trainingStyles('glasses', rig)) {
        const look = { ...base, styles: { ...styles, glasses, face: 'grin' as const } };
        expect(isValidAvatar(look)).toBe(true);
        expect(normalizeAvatar(look)).toEqual(look);
        expect(applyOutfit(look, 'hoodie-warmup').styles).toMatchObject({ glasses, face: 'grin' });
      }
      const round = { ...base, styles: { ...styles, glasses: 'round-glasses' as const } };
      expect(sameAvatar(base, round)).toBe(false);
      expect(isValidAvatar({ ...base, styles: { ...styles, glasses: 'unknown' } })).toBe(false);
    }
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
    const original = starterAvatar(101);
    original.styles = { hair: 'locs', body: 'broad', top: 'tee', shoes: 'runners', beard: 'goatee' };
    original.colors.beard = 'silver';
    for (const id of outfitsFor('standard')) {
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
