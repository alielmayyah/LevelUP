/*
 * The character catalog: which color presets each part offers, and the rules
 * that turn a saved config (preset IDs only) into the colors the art paints.
 *
 * Saved data is a list of choices from this catalog, never raw colors or
 * markup, so the renderer only ever paints bundled colors.
 */
import type { AvatarConfigDto, AvatarPart, AvatarStyles } from '../api/types';
import palettes from './palettes.json';

export type { AvatarConfigDto, AvatarPart };

export type ResolvedStyles = Required<AvatarStyles>;
export type StylePart = keyof ResolvedStyles;
export type ColorPart = AvatarPart | 'beard';
export const CUSTOMIZER_TABS = ['outfits', 'top', 'pants', 'shoes', 'hair', 'beard', 'body', 'face'] as const;
export type CustomizerTab = (typeof CUSTOMIZER_TABS)[number];

export const STYLES: { [K in StylePart]: readonly ResolvedStyles[K][] } = {
  hair: ['curls', 'fade', 'side-part', 'locs', 'top-knot'],
  body: ['balanced', 'lean', 'broad', 'compact'],
  top: ['tank', 'tee', 'hoodie', 'track-jacket'],
  shoes: ['trainers', 'high-tops', 'runners', 'slip-ons'],
  pants: ['shorts', 'joggers', 'cargo', 'track-pants'],
  beard: ['clean-shaven', 'stubble', 'mustache', 'goatee', 'short-beard', 'full-beard'],
};

export const STYLE_PARTS = Object.keys(STYLES) as StylePart[];

function styleFor<K extends StylePart>(part: K, value: unknown): ResolvedStyles[K] {
  const options: readonly ResolvedStyles[K][] = STYLES[part];
  return options.find((id) => id === value) ?? options[0];
}

export function stylesFor(value?: Partial<Record<StylePart, unknown>> | null): ResolvedStyles {
  return {
    hair: styleFor('hair', value?.hair),
    body: styleFor('body', value?.body),
    top: styleFor('top', value?.top),
    shoes: styleFor('shoes', value?.shoes),
    pants: styleFor('pants', value?.pants),
    beard: styleFor('beard', value?.beard),
  };
}

export interface Preset {
  id: string;
  color: string;
}

interface Palette {
  default: string;
  presets: Preset[];
}

/** Order of the editor sections. */
export const AVATAR_PARTS: readonly AvatarPart[] = ['skin', 'hair', 'eyes', 'smile', 'tank', 'shorts', 'shoes'];

const { outline, ...parts } = palettes;
const CATALOG = parts as Record<AvatarPart, Palette>;

export const AVATAR_SCHEMA_VERSION = 1;

/** Fixed outline of the art. It reads on both themes, so it does not follow the palette. */
export const OUTLINE: string = outline;

export const MATCH_HAIR = 'match-hair';

export const presetsFor = (part: ColorPart): readonly Preset[] => CATALOG[part === 'beard' ? 'hair' : part].presets;

const has = (part: ColorPart, id: unknown): id is string =>
  typeof id === 'string' && (presetsFor(part).some((p) => p.id === id) || (part === 'beard' && id === MATCH_HAIR));

const defaults = (): AvatarConfigDto['colors'] =>
  Object.fromEntries(AVATAR_PARTS.map((p) => [p, CATALOG[p].default])) as AvatarConfigDto['colors'];

/** The catalog's default look. */
export const defaultAvatar = (): AvatarConfigDto => ({
  schemaVersion: AVATAR_SCHEMA_VERSION,
  rig: 'standard',
  colors: defaults(),
  styles: stylesFor(),
});

/** True when `value` is a config this catalog can save as is. */
export function isValidAvatar(value: unknown): value is AvatarConfigDto {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<AvatarConfigDto>;
  if (v.schemaVersion !== AVATAR_SCHEMA_VERSION || v.rig !== 'standard') return false;
  if (!v.colors || typeof v.colors !== 'object') return false;
  const keys = Object.keys(v.colors);
  if (keys.some((k) => k !== 'beard' && !AVATAR_PARTS.includes(k as AvatarPart))) return false;
  if (v.colors.beard !== undefined && !has('beard', v.colors.beard)) return false;
  if (v.styles !== undefined) {
    if (!v.styles || typeof v.styles !== 'object') return false;
    const chosen = v.styles;
    if (Object.keys(chosen).some((part) => !STYLE_PARTS.includes(part as StylePart))) return false;
    if (
      !STYLE_PARTS.every((part) => {
        const id = chosen[part];
        return id === styleFor(part, id) || (id === undefined && (part === 'pants' || part === 'beard'));
      })
    )
      return false;
  }
  return AVATAR_PARTS.every((p) => has(p, v.colors![p]));
}

/**
 * Reads any stored value as a config: unknown or retired preset IDs fall back
 * to that part's default and keep the other choices.
 */
export function normalizeAvatar(value: unknown): AvatarConfigDto {
  const colors = defaults();
  const saved = (value as { colors?: Record<string, unknown> } | null)?.colors;
  if (saved && typeof saved === 'object') {
    for (const p of AVATAR_PARTS) if (has(p, saved[p])) colors[p] = saved[p];
    if (has('beard', saved.beard)) colors.beard = saved.beard;
  }
  const styles = (value as { styles?: Partial<Record<StylePart, unknown>> } | null)?.styles;
  return { schemaVersion: AVATAR_SCHEMA_VERSION, rig: 'standard', colors, styles: stylesFor(styles) };
}

/** Small seeded generator (mulberry32), so a seed always gives the same look. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A string hash (FNV-1a) for seeding. */
const hash = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
};

/** A valid look picked at random. Pass `random` for a repeatable result. */
function randomColors(random: () => number): AvatarConfigDto['colors'] {
  const colors = defaults();
  for (const p of AVATAR_PARTS) {
    const list = CATALOG[p].presets;
    colors[p] = list[Math.floor(random() * list.length) % list.length].id;
  }
  return colors;
}

export function randomAvatar(random: () => number = Math.random): AvatarConfigDto {
  const colors = randomColors(random);
  const pick = <T>(options: readonly T[]): T => options[Math.floor(random() * options.length) % options.length];
  return {
    schemaVersion: AVATAR_SCHEMA_VERSION,
    rig: 'standard',
    colors,
    styles: {
      hair: pick(STYLES.hair),
      body: pick(STYLES.body),
      top: pick(STYLES.top),
      shoes: pick(STYLES.shoes),
      pants: pick(STYLES.pants),
      beard: pick(STYLES.beard),
    },
  };
}

/**
 * The look a member gets before saving one. It comes from an opaque member
 * identifier only (never name, age, sex, or scans) and is the same every time.
 */
export const starterAvatar = (memberKey: string): AvatarConfigDto => ({
  ...defaultAvatar(),
  colors: randomColors(seeded(hash(memberKey))),
});

export function sameAvatar(a: AvatarConfigDto, b: AvatarConfigDto): boolean {
  const first = stylesFor(a.styles);
  const second = stylesFor(b.styles);
  return (
    AVATAR_PARTS.every((p) => a.colors[p] === b.colors[p]) &&
    (a.colors.beard ?? MATCH_HAIR) === (b.colors.beard ?? MATCH_HAIR) &&
    STYLE_PARTS.every((p) => first[p] === second[p])
  );
}

type Outfit = {
  styles: Pick<ResolvedStyles, 'top' | 'pants' | 'shoes'>;
  colors: Pick<AvatarConfigDto['colors'], 'tank' | 'shorts' | 'shoes'>;
};

export const OUTFITS = {
  'dark-hoodie': {
    styles: { top: 'hoodie', pants: 'joggers', shoes: 'high-tops' },
    colors: { tank: 'charcoal', shorts: 'charcoal', shoes: 'charcoal' },
  },
  'summer-fit': {
    styles: { top: 'tee', pants: 'shorts', shoes: 'slip-ons' },
    colors: { tank: 'cream', shorts: 'teal', shoes: 'off-white' },
  },
  'gym-ready': {
    styles: { top: 'tank', pants: 'shorts', shoes: 'runners' },
    colors: { tank: 'levelup-violet', shorts: 'navy', shoes: 'violet' },
  },
  'track-fit': {
    styles: { top: 'track-jacket', pants: 'track-pants', shoes: 'trainers' },
    colors: { tank: 'rust', shorts: 'slate', shoes: 'off-white' },
  },
} satisfies Record<string, Outfit>;

export type OutfitId = keyof typeof OUTFITS;
export const OUTFIT_IDS = Object.keys(OUTFITS) as OutfitId[];

export function applyOutfit(config: AvatarConfigDto, id: OutfitId): AvatarConfigDto {
  const outfit = OUTFITS[id];
  return {
    ...config,
    styles: { ...stylesFor(config.styles), ...outfit.styles },
    colors: { ...config.colors, ...outfit.colors },
  };
}

/* ---------- Paint ---------- */

const channels = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb: number[]): string =>
  '#' +
  rgb
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

/** Scales each channel toward black. */
const darken = (hex: string, k: [number, number, number]) => toHex(channels(hex).map((c, i) => c * k[i]));
/** Moves each channel part of the way toward white. */
const lighten = (hex: string, k: [number, number, number]) => toHex(channels(hex).map((c, i) => c + (255 - c) * k[i]));

const luminance = (hex: string): number =>
  channels(hex)
    .map((c) => c / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);

export function contrastRatio(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Move only as far as needed to keep the mark visible on the face.
function featureAccent(fill: string, skin: string, target: number): string {
  if (contrastRatio(fill, skin) >= target) return fill;
  const ink = channels(contrastRatio(OUTLINE, skin) >= target ? OUTLINE : colorOf('skin', 'fair'));
  const base = channels(fill);
  for (let step = 1; step <= 20; step++) {
    const tint = toHex(base.map((c, i) => c + (ink[i] - c) * (step / 20)));
    if (contrastRatio(tint, skin) >= target) return tint;
  }
  return toHex(ink);
}

/*
 * Factors tuned so the default presets reproduce the hand-picked shades of the
 * original art exactly; other presets keep the same relationship.
 */
const SKIN_SHADE: [number, number, number] = [187 / 212, 96 / 124, 63 / 81];
const HAIR_LIGHT: [number, number, number] = [20 / 202, 13 / 230, 15 / 208];
const HAIR_SHADE: [number, number, number] = [42 / 53, 20 / 25, 38 / 47];

export interface AvatarPaint {
  outline: string;
  skin: string;
  skinShade: string;
  hair: string;
  hairLight: string;
  hairShade: string;
  eyes: string;
  eyeAccent: string;
  mouth: string;
  beard: string;
  beardShade: string;
  stubble: string;
  tank: string;
  topLight: string;
  topShade: string;
  shorts: string;
  pantsShade: string;
  pantsLight: string;
  shoes: string;
  shoeShade: string;
  trim: string;
}

const colorOf = (part: AvatarPart, id: string): string =>
  (CATALOG[part].presets.find((p) => p.id === id) ?? CATALOG[part].presets.find((p) => p.id === CATALOG[part].default)!)
    .color;

/** Resolves a config to the fills of every paint role. */
export function paintFor(config: AvatarConfigDto): AvatarPaint {
  const c = (part: AvatarPart) => colorOf(part, config.colors[part]);
  const skin = c('skin');
  const hair = c('hair');
  const beardId = config.colors.beard ?? MATCH_HAIR;
  const beard = beardId === MATCH_HAIR ? hair : colorOf('hair', beardId);
  const eyes = c('eyes');
  const iris = featureAccent(eyes, skin, 1.9);
  const top = c('tank');
  const pants = c('shorts');
  const shoes = c('shoes');
  return {
    outline: OUTLINE,
    skin,
    skinShade: darken(skin, SKIN_SHADE),
    hair,
    hairLight: lighten(hair, HAIR_LIGHT),
    hairShade: darken(hair, HAIR_SHADE),
    eyes: iris,
    eyeAccent: iris !== eyes && contrastRatio(OUTLINE, skin) < 1.9 ? featureAccent(eyes, skin, 2.35) : iris,
    mouth: featureAccent(c('smile'), skin, 2.1),
    beard,
    beardShade: darken(beard, [0.75, 0.75, 0.75]),
    stubble: toHex(channels(skin).map((c, i) => c + (channels(beard)[i] - c) * 0.62)),
    tank: top,
    topLight: lighten(top, [0.24, 0.24, 0.24]),
    topShade: darken(top, [0.68, 0.68, 0.68]),
    shorts: pants,
    pantsShade: darken(pants, [0.68, 0.68, 0.68]),
    pantsLight: lighten(pants, [0.25, 0.25, 0.25]),
    shoes,
    shoeShade: darken(shoes, [0.65, 0.65, 0.65]),
    trim: colorOf('shoes', 'off-white'),
  };
}
