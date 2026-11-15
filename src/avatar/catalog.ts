/*
 * The character catalog: which color presets each part offers, and the rules
 * that turn a saved config (preset IDs only) into the colors the art paints.
 *
 * Saved data is a list of choices from this catalog, never raw colors or
 * markup, so the renderer only ever paints bundled colors.
 */
import type { AvatarConfigDto, AvatarPart, AvatarRig, AvatarStyles, ProfileDto } from '../api/types';
import palettes from './palettes.json';

export type { AvatarConfigDto, AvatarPart, AvatarRig };
export const AVATAR_RIGS = ['standard', 'women'] as const satisfies readonly AvatarRig[];
export const WOMEN_HAIR = [
  'high-ponytail',
  'braided-ponytail',
  'low-bun',
  'puff',
  'double-braids',
  'high-bun',
] as const;
export const isTiedHair = (style: ResolvedStyles['hair']): style is (typeof WOMEN_HAIR)[number] =>
  WOMEN_HAIR.some((id) => id === style);
export const HIJAB_STYLES = ['sport-hijab', 'wrap-hijab', 'longline-hijab'] as const;
export type HijabStyle = (typeof HIJAB_STYLES)[number];
export const isHijab = (style: string): style is HijabStyle => HIJAB_STYLES.some((id) => id === style);

export type ResolvedStyles = Required<AvatarStyles>;
export type StylePart = keyof ResolvedStyles;
export type ColorPart = AvatarPart | 'beard' | 'socks' | 'hijab';
export const CUSTOMIZER_TABS = ['outfits', 'top', 'pants', 'shoes', 'socks', 'hair', 'beard', 'body', 'face'] as const;
export type CustomizerTab = (typeof CUSTOMIZER_TABS)[number];

export const STYLES: { [K in StylePart]: readonly ResolvedStyles[K][] } = {
  hair: [
    'curls',
    'fade',
    'side-part',
    'locs',
    'top-knot',
    'buzz-cut',
    'waves',
    'shaved',
    'spikes',
    'braids',
    'tapered-curls',
    ...WOMEN_HAIR,
    ...HIJAB_STYLES,
  ],
  body: ['balanced', 'lean', 'broad', 'compact', 'tall', 'stocky', 'athletic', 'relaxed', 'long-limbed', 'power-build'],
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
    'longline-tank',
    'racerback-bra',
    'fitted-zip',
    'hood-up',
    'zip-hoodie',
    'raglan-top',
    'longline-training-top',
  ],
  shoes: [
    'trainers',
    'high-tops',
    'runners',
    'slip-ons',
    'boots',
    'canvas',
    'lifters',
    'cross-trainers',
    'barefoot',
    'flat-lifters',
    'cushioned-runners',
  ],
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
    'high-rise-leggings',
    'capris',
    'tapered-joggers',
    'panel-tights',
    'loose-training-shorts',
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
    'boxed-beard',
    'circle-beard',
  ],
  socks: [
    'no-socks',
    'ankle-socks',
    'crew-socks',
    'striped-socks',
    'knee-highs',
    'grip-socks',
    'cushioned-socks',
    'tab-socks',
    'compression-socks',
  ],
  face: ['smile', 'focused', 'grin'],
  glasses: ['no-glasses', 'round-glasses', 'rectangular-glasses', 'sport-glasses'],
};

// Older casual styles still render on saved characters.
const CASUAL_STYLES: ReadonlySet<string> = new Set(['varsity', 'jeans', 'cargo', 'boots', 'canvas', 'slip-ons']);
const WOMEN_ONLY_STYLES: ReadonlySet<string> = new Set([
  ...WOMEN_HAIR,
  ...HIJAB_STYLES,
  'longline-tank',
  'racerback-bra',
  'fitted-zip',
  'high-rise-leggings',
  'capris',
]);
const MEN_ONLY_STYLES: ReadonlySet<string> = new Set(['fade', 'side-part', 'buzz-cut', 'waves', 'spikes']);

function isStyleForRig(part: StylePart, style: string, rig: AvatarRig): boolean {
  if (rig === 'standard') return !WOMEN_ONLY_STYLES.has(style);
  if (part === 'beard') return style === 'clean-shaven';
  return !MEN_ONLY_STYLES.has(style);
}

export function trainingStyles<K extends StylePart>(
  part: K,
  rig: AvatarRig,
  current?: ResolvedStyles[K],
): readonly ResolvedStyles[K][] {
  return STYLES[part].filter(
    (style) => isStyleForRig(part, style, rig) && (style === current || !CASUAL_STYLES.has(style)),
  );
}

const WOMEN_TABS = CUSTOMIZER_TABS.filter((tab) => tab !== 'beard');
export const customizerTabsFor = (rig: AvatarRig): readonly CustomizerTab[] =>
  rig === 'women' ? WOMEN_TABS : CUSTOMIZER_TABS;

export const showsLowerLeg = (pants: ResolvedStyles['pants']): boolean =>
  pants === 'shorts' ||
  pants === 'bike-shorts' ||
  pants === 'liner-shorts' ||
  pants === 'split-shorts' ||
  pants === 'loose-training-shorts' ||
  pants === 'capris';

export const hasLongSleeves = (top: ResolvedStyles['top']): boolean =>
  top !== 'tank' &&
  top !== 'sleeveless-hoodie' &&
  top !== 'tee' &&
  top !== 'mesh-tee' &&
  top !== 'longline-tank' &&
  top !== 'racerback-bra';

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
    face: styleFor('face', value?.face),
    glasses: styleFor('glasses', value?.glasses),
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
const OPTIONAL_COLORS = { beard: MATCH_HAIR, socks: 'off-white', hijab: 'navy' } as const;
const OPTIONAL_STYLES: readonly StylePart[] = ['pants', 'beard', 'socks', 'face', 'glasses'];

const isUncoveredHair = (value: unknown): value is ResolvedStyles['hair'] =>
  STYLES.hair.some((style) => style === value && !isHijab(style));

const palettePart = (part: ColorPart): AvatarPart => {
  if (part === 'beard') return 'hair';
  if (part === 'socks') return 'shoes';
  if (part === 'hijab') return 'tank';
  return part;
};

export const presetsFor = (part: ColorPart): readonly Preset[] => CATALOG[palettePart(part)].presets;

export function colorIdFor(config: AvatarConfigDto, part: ColorPart): string {
  if (part === 'beard' || part === 'socks' || part === 'hijab') return config.colors[part] ?? OPTIONAL_COLORS[part];
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
  if (v.schemaVersion !== AVATAR_SCHEMA_VERSION || !v.rig || !AVATAR_RIGS.includes(v.rig)) return false;
  if (v.hairUnderHijab !== undefined && !isUncoveredHair(v.hairUnderHijab)) return false;
  if (!v.colors || typeof v.colors !== 'object') return false;
  const keys = Object.keys(v.colors);
  if (keys.some((k) => k !== 'smile' && !Object.hasOwn(OPTIONAL_COLORS, k) && !AVATAR_PARTS.includes(k as AvatarPart)))
    return false;
  if (v.colors.smile !== undefined && !['dark-plum', 'brown', 'warm-brown'].includes(v.colors.smile)) return false;
  for (const part of ['beard', 'socks', 'hijab'] as const) {
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
    if (has('hijab', saved.hijab)) colors.hijab = saved.hijab;
  }
  const config = value as {
    rig?: unknown;
    styles?: Partial<Record<StylePart, unknown>>;
    hairUnderHijab?: unknown;
  } | null;
  return {
    schemaVersion: AVATAR_SCHEMA_VERSION,
    rig: config?.rig === 'women' ? 'women' : 'standard',
    colors,
    styles: stylesFor(config?.styles),
    ...(isUncoveredHair(config?.hairUnderHijab) ? { hairUnderHijab: config.hairUnderHijab } : {}),
  };
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

export function randomAvatar(
  random: () => number = Math.random,
  rig: AvatarRig = 'standard',
  current?: AvatarConfigDto,
): AvatarConfigDto {
  const colors = randomColors(random);
  const pick = <T>(options: readonly T[]): T => options[Math.floor(random() * options.length) % options.length];
  const currentHair = stylesFor(current?.styles).hair;
  const covered = current && rig === 'women' && isHijab(currentHair);
  if (covered) {
    colors.hair = current.colors.hair;
    colors.hijab = colorIdFor(current, 'hijab');
  }
  return {
    schemaVersion: AVATAR_SCHEMA_VERSION,
    rig,
    colors,
    styles: {
      hair: covered ? currentHair : pick(trainingStyles('hair', rig).filter((style) => !isHijab(style))),
      body: pick(STYLES.body),
      top: pick(trainingStyles('top', rig).filter((top) => !covered || hasLongSleeves(top))),
      shoes: pick(trainingStyles('shoes', rig)),
      pants: pick(trainingStyles('pants', rig).filter((pants) => !covered || !showsLowerLeg(pants))),
      beard: pick(trainingStyles('beard', rig)),
      socks: pick(STYLES.socks),
      face: pick(STYLES.face),
      glasses: pick(STYLES.glasses),
    },
    ...(covered && current.hairUnderHijab ? { hairUnderHijab: current.hairUnderHijab } : {}),
  };
}

/**
 * The look a member gets before saving one. It comes from an opaque member
 * identifier only (never name, age, sex, or scans) and is the same every time.
 */
const starterAvatar = (memberKey: string): AvatarConfigDto => ({
  ...defaultAvatar(),
  colors: randomColors(seeded(hash(memberKey)), true),
});

export function memberAvatar({
  memberId,
  sex,
  avatar,
}: Pick<ProfileDto, 'memberId' | 'avatar'> & Partial<Pick<ProfileDto, 'sex'>>): AvatarConfigDto {
  const config = avatar ? normalizeAvatar(avatar) : starterAvatar(String(memberId));
  const rig = sex === undefined ? config.rig : sex === 'FEMALE' ? 'women' : 'standard';
  const styles = stylesFor(config.styles);
  const defaultHair = rig === 'women' ? 'high-ponytail' : 'curls';
  if (!isStyleForRig('hair', styles.hair, rig) || (rig !== config.rig && styles.hair === 'curls')) {
    styles.hair = defaultHair;
  }
  if (!isStyleForRig('top', styles.top, rig)) styles.top = 'tee';
  if (!isStyleForRig('pants', styles.pants, rig)) styles.pants = 'track-pants';
  if (!isStyleForRig('beard', styles.beard, rig)) styles.beard = 'clean-shaven';
  return { ...config, rig, styles };
}

export function sameAvatar(a: AvatarConfigDto, b: AvatarConfigDto): boolean {
  const first = stylesFor(a.styles);
  const second = stylesFor(b.styles);
  return (
    a.rig === b.rig &&
    a.hairUnderHijab === b.hairUnderHijab &&
    AVATAR_PARTS.every((p) => a.colors[p] === b.colors[p]) &&
    colorIdFor(a, 'beard') === colorIdFor(b, 'beard') &&
    colorIdFor(a, 'socks') === colorIdFor(b, 'socks') &&
    colorIdFor(a, 'hijab') === colorIdFor(b, 'hijab') &&
    STYLE_PARTS.every((p) => first[p] === second[p])
  );
}

export function withHair(config: AvatarConfigDto, hair: ResolvedStyles['hair']): AvatarConfigDto {
  const styles = stylesFor(config.styles);
  const { hairUnderHijab, ...look } = config;
  const remembered = isHijab(styles.hair) ? hairUnderHijab : styles.hair;
  return {
    ...look,
    styles: { ...styles, hair },
    ...(isHijab(hair) && remembered ? { hairUnderHijab: remembered } : {}),
  };
}

export function removeHijab(config: AvatarConfigDto): AvatarConfigDto {
  const hair = config.hairUnderHijab ?? 'high-ponytail';
  return withHair(config, isStyleForRig('hair', hair, config.rig) ? hair : 'high-ponytail');
}

type Outfit = {
  styles: Pick<ResolvedStyles, 'top' | 'pants' | 'shoes' | 'socks'> & Partial<Pick<ResolvedStyles, 'hair' | 'beard'>>;
  colors: Required<Pick<AvatarConfigDto['colors'], 'tank' | 'shorts' | 'shoes' | 'socks'>> &
    Pick<AvatarConfigDto['colors'], 'hijab'>;
};

export const OUTFITS = {
  'hijab-training': {
    styles: {
      hair: 'sport-hijab',
      beard: 'clean-shaven',
      top: 'fitted-zip',
      pants: 'track-pants',
      shoes: 'runners',
      socks: 'crew-socks',
    },
    colors: { hijab: 'navy', tank: 'cloud-blue', shorts: 'charcoal', shoes: 'off-white', socks: 'charcoal' },
  },
  'violet-training': {
    styles: { top: 'longline-tank', pants: 'high-rise-leggings', shoes: 'cross-trainers', socks: 'ankle-socks' },
    colors: { tank: 'levelup-violet', shorts: 'charcoal', shoes: 'violet', socks: 'off-white' },
  },
  'pilates-studio': {
    styles: { top: 'racerback-bra', pants: 'high-rise-leggings', shoes: 'barefoot', socks: 'grip-socks' },
    colors: { tank: 'sage', shorts: 'forest', shoes: 'charcoal', socks: 'sage' },
  },
  'run-club': {
    styles: { top: 'fitted-zip', pants: 'capris', shoes: 'runners', socks: 'cushioned-socks' },
    colors: { tank: 'coral', shorts: 'graphite', shoes: 'off-white', socks: 'off-white' },
  },
  'lift-club': {
    styles: { top: 'racerback-bra', pants: 'liner-shorts', shoes: 'lifters', socks: 'striped-socks' },
    colors: { tank: 'plum', shorts: 'aubergine', shoes: 'charcoal', socks: 'off-white' },
  },
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
  'hoodie-warmup': {
    styles: { top: 'hood-up', pants: 'tapered-joggers', shoes: 'flat-lifters', socks: 'crew-socks' },
    colors: { tank: 'plum', shorts: 'graphite', shoes: 'off-white', socks: 'off-white' },
  },
  conditioning: {
    styles: { top: 'raglan-top', pants: 'loose-training-shorts', shoes: 'cushioned-runners', socks: 'tab-socks' },
    colors: { tank: 'electric-blue', shorts: 'navy', shoes: 'off-white', socks: 'electric-blue' },
  },
  'zip-hoodie-session': {
    styles: { top: 'zip-hoodie', pants: 'panel-tights', shoes: 'flat-lifters', socks: 'compression-socks' },
    colors: { tank: 'sage', shorts: 'forest', shoes: 'charcoal', socks: 'charcoal' },
  },
  'covered-cardio': {
    styles: {
      hair: 'wrap-hijab',
      top: 'longline-training-top',
      pants: 'tapered-joggers',
      shoes: 'cushioned-runners',
      socks: 'compression-socks',
    },
    colors: { hijab: 'plum', tank: 'orchid', shorts: 'aubergine', shoes: 'off-white', socks: 'charcoal' },
  },
  'covered-strength': {
    styles: {
      hair: 'longline-hijab',
      top: 'zip-hoodie',
      pants: 'warmup-pants',
      shoes: 'flat-lifters',
      socks: 'crew-socks',
    },
    colors: { hijab: 'sage', tank: 'sage', shorts: 'graphite', shoes: 'charcoal', socks: 'charcoal' },
  },
} satisfies Record<string, Outfit>;

export type OutfitId = keyof typeof OUTFITS;
const SHARED_OUTFIT_IDS = [
  'hoodie-warmup',
  'conditioning',
  'zip-hoodie-session',
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

export function outfitsFor(rig: AvatarRig): readonly OutfitId[] {
  if (rig === 'standard') return SHARED_OUTFIT_IDS;
  return [
    'hijab-training',
    'covered-cardio',
    'covered-strength',
    'violet-training',
    'pilates-studio',
    'run-club',
    'lift-club',
    ...SHARED_OUTFIT_IDS,
  ];
}

export function applyOutfit(config: AvatarConfigDto, id: OutfitId): AvatarConfigDto {
  const outfit: Outfit = OUTFITS[id];
  const look = outfit.styles.hair ? withHair(config, outfit.styles.hair) : config;
  return {
    ...look,
    styles: { ...stylesFor(look.styles), ...outfit.styles },
    colors: { ...look.colors, ...outfit.colors },
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
  hijab: string;
  hijabLight: string;
  hijabShade: string;
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
  const hijab = colorOf('tank', colorIdFor(config, 'hijab'));
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
    hijab,
    hijabLight: lighten(hijab, [0.22, 0.22, 0.22]),
    hijabShade: darken(hijab, [0.7, 0.7, 0.7]),
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
