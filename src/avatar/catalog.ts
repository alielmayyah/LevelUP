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
export type ColorPart = AvatarPart | 'beard' | 'socks';
export const CUSTOMIZER_TABS = ['outfits', 'top', 'pants', 'shoes', 'socks', 'hair', 'beard', 'body', 'face'] as const;
export type CustomizerTab = (typeof CUSTOMIZER_TABS)[number];

export const STYLES: { [K in StylePart]: readonly ResolvedStyles[K][] } = {
  hair: ['curls', 'fade', 'side-part', 'locs', 'top-knot', 'buzz-cut', 'waves', 'shaved', 'spikes', 'braids'],
  body: ['balanced', 'lean', 'broad', 'compact', 'tall', 'stocky', 'athletic', 'relaxed'],
  top: [
    'tank',
    'tee',
    'hoodie',
    'track-jacket',
    'sweatshirt',
    'varsity',
    'mesh-tee',
    'compression-top',
    'quarter-zip',
    'sleeveless-hoodie',
  ],
  shoes: ['trainers', 'high-tops', 'runners', 'slip-ons', 'boots', 'canvas', 'lifters', 'cross-trainers', 'barefoot'],
  pants: [
    'shorts',
    'joggers',
    'cargo',
    'track-pants',
    'jeans',
    'bike-shorts',
    'liner-shorts',
    'training-tights',
    'split-shorts',
    'warmup-pants',
  ],
  beard: [
    'clean-shaven',
    'stubble',
    'mustache',
    'goatee',
    'short-beard',
    'full-beard',
    'chin-strap',
    'fade-beard',
    'chin-tuft',
  ],
  socks: ['no-socks', 'ankle-socks', 'crew-socks', 'striped-socks', 'knee-highs', 'grip-socks', 'cushioned-socks'],
};

// Older casual styles still render on saved characters.
const CASUAL_STYLES: ReadonlySet<string> = new Set(['varsity', 'jeans', 'boots', 'canvas', 'slip-ons']);

export function trainingStyles<K extends StylePart>(
  part: K,
  current?: ResolvedStyles[K],
): readonly ResolvedStyles[K][] {
  return STYLES[part].filter((style) => style === current || !CASUAL_STYLES.has(style));
}

export const showsLowerLeg = (pants: ResolvedStyles['pants']): boolean =>
  pants === 'shorts' || pants === 'bike-shorts' || pants === 'liner-shorts' || pants === 'split-shorts';

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
    socks: styleFor('socks', value?.socks),
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
export const AVATAR_PARTS: readonly AvatarPart[] = ['skin', 'hair', 'eyes', 'tank', 'shorts', 'shoes'];

const { outline, ...parts } = palettes;
const CATALOG = parts as Record<AvatarPart, Palette>;

export const AVATAR_SCHEMA_VERSION = 1;

/** Fixed outline of the art. It reads on both themes, so it does not follow the palette. */
export const OUTLINE: string = outline;

export const MATCH_HAIR = 'match-hair';
const OPTIONAL_COLORS = { beard: MATCH_HAIR, socks: 'off-white' } as const;
const OPTIONAL_STYLES: readonly StylePart[] = ['pants', 'beard', 'socks'];

const palettePart = (part: ColorPart): AvatarPart => {
  if (part === 'beard') return 'hair';
  if (part === 'socks') return 'shoes';
  return part;
};

export const presetsFor = (part: ColorPart): readonly Preset[] => CATALOG[palettePart(part)].presets;

export function colorIdFor(config: AvatarConfigDto, part: ColorPart): string {
  if (part === 'beard' || part === 'socks') return config.colors[part] ?? OPTIONAL_COLORS[part];
  return config.colors[part];
}

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
  if (keys.some((k) => k !== 'smile' && !Object.hasOwn(OPTIONAL_COLORS, k) && !AVATAR_PARTS.includes(k as AvatarPart)))
    return false;
  if (v.colors.smile !== undefined && !['dark-plum', 'brown', 'warm-brown'].includes(v.colors.smile)) return false;
  for (const part of ['beard', 'socks'] as const) {
    if (v.colors[part] !== undefined && !has(part, v.colors[part])) return false;
  }
  if (v.styles !== undefined) {
    if (!v.styles || typeof v.styles !== 'object') return false;
    const chosen = v.styles;
    if (Object.keys(chosen).some((part) => !STYLE_PARTS.includes(part as StylePart))) return false;
    if (
      !STYLE_PARTS.every((part) => {
        const id = chosen[part];
        return id === styleFor(part, id) || (id === undefined && OPTIONAL_STYLES.includes(part));
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
    if (has('socks', saved.socks)) colors.socks = saved.socks;
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
function randomColors(random: () => number, keepStarterSequence = false): AvatarConfigDto['colors'] {
  const colors = defaults();
  const originalPaletteSize: Record<AvatarPart, number> = { skin: 8, hair: 6, eyes: 6, tank: 8, shorts: 6, shoes: 7 };
  for (const p of AVATAR_PARTS) {
    // Older starters drew a smile color just before the top color.
    if (keepStarterSequence && p === 'tank') random();
    const list = CATALOG[p].presets;
    const count = keepStarterSequence ? originalPaletteSize[p] : list.length;
    colors[p] = list[Math.floor(random() * count) % count].id;
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
      top: pick(trainingStyles('top')),
      shoes: pick(trainingStyles('shoes')),
      pants: pick(trainingStyles('pants')),
      beard: pick(STYLES.beard),
      socks: pick(STYLES.socks),
    },
  };
}

/**
 * The look a member gets before saving one. It comes from an opaque member
 * identifier only (never name, age, sex, or scans) and is the same every time.
 */
export const starterAvatar = (memberKey: string): AvatarConfigDto => ({
  ...defaultAvatar(),
  colors: randomColors(seeded(hash(memberKey)), true),
});

export function sameAvatar(a: AvatarConfigDto, b: AvatarConfigDto): boolean {
  const first = stylesFor(a.styles);
  const second = stylesFor(b.styles);
  return (
    AVATAR_PARTS.every((p) => a.colors[p] === b.colors[p]) &&
    colorIdFor(a, 'beard') === colorIdFor(b, 'beard') &&
    colorIdFor(a, 'socks') === colorIdFor(b, 'socks') &&
    STYLE_PARTS.every((p) => first[p] === second[p])
  );
}

type Outfit = {
  styles: Pick<ResolvedStyles, 'top' | 'pants' | 'shoes' | 'socks'>;
  colors: Required<Pick<AvatarConfigDto['colors'], 'tank' | 'shorts' | 'shoes' | 'socks'>>;
};

export const OUTFITS = {
  'dark-hoodie': {
    styles: { top: 'hoodie', pants: 'joggers', shoes: 'high-tops', socks: 'crew-socks' },
    colors: { tank: 'charcoal', shorts: 'charcoal', shoes: 'charcoal', socks: 'charcoal' },
  },
  'summer-fit': {
    styles: { top: 'mesh-tee', pants: 'shorts', shoes: 'cross-trainers', socks: 'no-socks' },
    colors: { tank: 'cream', shorts: 'teal', shoes: 'off-white', socks: 'off-white' },
  },
  'gym-ready': {
    styles: { top: 'tank', pants: 'shorts', shoes: 'runners', socks: 'striped-socks' },
    colors: { tank: 'levelup-violet', shorts: 'navy', shoes: 'violet', socks: 'off-white' },
  },
  'track-fit': {
    styles: { top: 'track-jacket', pants: 'track-pants', shoes: 'trainers', socks: 'ankle-socks' },
    colors: { tank: 'rust', shorts: 'slate', shoes: 'off-white', socks: 'off-white' },
  },
  'spin-class': {
    styles: { top: 'tank', pants: 'bike-shorts', shoes: 'runners', socks: 'knee-highs' },
    colors: { tank: 'coral', shorts: 'charcoal', shoes: 'teal', socks: 'off-white' },
  },
  'strength-day': {
    styles: { top: 'sleeveless-hoodie', pants: 'liner-shorts', shoes: 'lifters', socks: 'cushioned-socks' },
    colors: { tank: 'burgundy', shorts: 'charcoal', shoes: 'charcoal', socks: 'off-white' },
  },
  'circuit-training': {
    styles: { top: 'mesh-tee', pants: 'liner-shorts', shoes: 'cross-trainers', socks: 'ankle-socks' },
    colors: { tank: 'electric-blue', shorts: 'navy', shoes: 'teal', socks: 'slate' },
  },
  'treadmill-run': {
    styles: { top: 'tank', pants: 'split-shorts', shoes: 'runners', socks: 'cushioned-socks' },
    colors: { tank: 'coral', shorts: 'navy', shoes: 'off-white', socks: 'charcoal' },
  },
  'studio-flow': {
    styles: { top: 'compression-top', pants: 'training-tights', shoes: 'barefoot', socks: 'grip-socks' },
    colors: { tank: 'sage', shorts: 'forest', shoes: 'charcoal', socks: 'sage' },
  },
  'warm-up': {
    styles: { top: 'quarter-zip', pants: 'warmup-pants', shoes: 'trainers', socks: 'crew-socks' },
    colors: { tank: 'cloud-blue', shorts: 'slate', shoes: 'off-white', socks: 'off-white' },
  },
  'lifting-session': {
    styles: { top: 'compression-top', pants: 'bike-shorts', shoes: 'lifters', socks: 'striped-socks' },
    colors: { tank: 'levelup-violet', shorts: 'charcoal', shoes: 'violet', socks: 'charcoal' },
  },
} satisfies Record<string, Outfit>;

export type OutfitId = keyof typeof OUTFITS;
export const OUTFIT_IDS = [
  'strength-day',
  'circuit-training',
  'treadmill-run',
  'studio-flow',
  'warm-up',
  'lifting-session',
  'gym-ready',
  'spin-class',
  'track-fit',
  'summer-fit',
  'dark-hoodie',
] as const satisfies readonly OutfitId[];

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
  skinLight: string;
  hair: string;
  hairLight: string;
  hairShade: string;
  eyes: string;
  eyeAccent: string;
  mouth: string;
  beard: string;
  beardShade: string;
  beardLight: string;
  stubble: string;
  tank: string;
  topLight: string;
  topShade: string;
  topTrim: string;
  shorts: string;
  pantsShade: string;
  pantsLight: string;
  pantsTrim: string;
  shoes: string;
  shoeShade: string;
  shoeLight: string;
  shoeTrim: string;
  socks: string;
  sockShade: string;
  sockTrim: string;
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
  const socks = colorOf('shoes', colorIdFor(config, 'socks'));
  const trim = colorOf('shoes', 'off-white');
  const contrastTrim = (fabric: string) =>
    contrastRatio(trim, fabric) >= 2.4 ? trim : darken(fabric, [0.58, 0.58, 0.58]);
  return {
    outline: OUTLINE,
    skin,
    skinShade: darken(skin, SKIN_SHADE),
    skinLight: lighten(skin, [0.13, 0.09, 0.07]),
    hair,
    hairLight: lighten(hair, HAIR_LIGHT),
    hairShade: darken(hair, HAIR_SHADE),
    eyes: iris,
    eyeAccent: iris !== eyes && contrastRatio(OUTLINE, skin) < 1.9 ? featureAccent(eyes, skin, 2.35) : iris,
    mouth: featureAccent(darken(skin, [0.6, 0.54, 0.54]), skin, 2.1),
    beard,
    beardShade: darken(beard, [0.75, 0.75, 0.75]),
    beardLight: lighten(beard, [0.16, 0.14, 0.17]),
    stubble: toHex(channels(skin).map((c, i) => c + (channels(beard)[i] - c) * 0.28)),
    tank: top,
    topLight: lighten(top, [0.24, 0.24, 0.24]),
    topShade: darken(top, [0.68, 0.68, 0.68]),
    topTrim: contrastTrim(top),
    shorts: pants,
    pantsShade: darken(pants, [0.68, 0.68, 0.68]),
    pantsLight: lighten(pants, [0.25, 0.25, 0.25]),
    pantsTrim: contrastTrim(pants),
    shoes,
    shoeShade: darken(shoes, [0.65, 0.65, 0.65]),
    shoeLight: lighten(shoes, [0.22, 0.22, 0.22]),
    shoeTrim: contrastTrim(shoes),
    socks,
    sockShade: darken(socks, [0.72, 0.72, 0.72]),
    sockTrim: contrastTrim(socks),
    trim,
  };
}
