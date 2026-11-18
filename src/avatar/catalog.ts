/*
 * The character catalog defines portrait looks and color presets.
 * Saves store catalog IDs. Older saves get
 * the default portrait and keep recognized color presets.
 */
import type { AvatarConfigDto, AvatarPart, AvatarPortraitDto, ProfileDto, Sex } from '../api/types';
import palettes from './palettes.hd.json';

export type { AvatarConfigDto, AvatarPart };

export const AVATAR_SCHEMA_VERSION = 2;

/** All parts stored in the avatar DTO. */
export const AVATAR_PARTS: readonly AvatarPart[] = ['skin', 'hair', 'top', 'bottom', 'shoes'];
export const PORTRAIT_LOOKS: Record<Sex, readonly AvatarPortraitDto['look'][]> = {
  MALE: ['curls', 'fade', 'swept'],
  FEMALE: ['curls', 'bob', 'bun', 'hijab'],
};
export const PORTRAIT_OUTFITS = ['tee', 'hoodie', 'jacket'] as const satisfies readonly AvatarPortraitDto['outfit'][];
export const PORTRAIT_EYES = palettes.eyes satisfies Record<AvatarPortraitDto['eyes'], string>;
const DEFAULT_PORTRAIT: AvatarPortraitDto = { look: 'curls', outfit: 'tee', eyes: 'brown' };
export const DEFAULT_HIJAB_COLOR = 'charcoal';

export function portraitOf(config: AvatarConfigDto, sex?: Sex): AvatarPortraitDto {
  const portrait = config.portrait ?? DEFAULT_PORTRAIT;
  return sex && !PORTRAIT_LOOKS[sex].includes(portrait.look) ? { ...portrait, look: DEFAULT_PORTRAIT.look } : portrait;
}

/** A color preset: a swatch to show, and the filter that recolors the art (hue turn in degrees, saturation and lightness factors). */
export interface Preset {
  id: string;
  swatch: string;
  hue: number;
  sat: number;
  light: number;
}

interface PartPalette {
  default: string;
  presets: Preset[];
}

const CATALOG = palettes as Record<AvatarPart, PartPalette>;

export const presetsFor = (part: AvatarPart): readonly Preset[] => CATALOG[part].presets;

export function presetFor(part: AvatarPart, id: string): Preset {
  const list = presetsFor(part);
  return list.find((p) => p.id === id) ?? list.find((p) => p.id === CATALOG[part].default) ?? list[0];
}

const has = (part: AvatarPart, id: unknown): id is string =>
  typeof id === 'string' && presetsFor(part).some((p) => p.id === id);

const defaultColors = (): AvatarConfigDto['colors'] =>
  Object.fromEntries(AVATAR_PARTS.map((p) => [p, CATALOG[p].default])) as AvatarConfigDto['colors'];

/** The default avatar colors, with portrait options supplied by portraitOf. */
export const defaultAvatar = (): AvatarConfigDto => ({ schemaVersion: AVATAR_SCHEMA_VERSION, colors: defaultColors() });

/** True when `value` is a config this catalog can save as is. */
export function isValidAvatar(value: unknown): value is AvatarConfigDto {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<AvatarConfigDto>;
  if (v.schemaVersion !== AVATAR_SCHEMA_VERSION || !v.colors || typeof v.colors !== 'object') return false;
  const keys = Object.keys(v.colors);
  if (keys.length !== AVATAR_PARTS.length) return false;
  return (
    AVATAR_PARTS.every((p) => has(p, (v.colors as Record<string, unknown>)[p])) &&
    (v.portrait === undefined || isValidPortrait(v.portrait))
  );
}

function isValidPortrait(value: unknown): value is AvatarPortraitDto {
  if (!value || typeof value !== 'object' || Object.keys(value).length !== (Object.hasOwn(value, 'hijabColor') ? 4 : 3))
    return false;
  const portrait = value as Partial<AvatarPortraitDto>;
  return (
    portrait.look !== undefined &&
    (PORTRAIT_LOOKS.MALE.includes(portrait.look) || PORTRAIT_LOOKS.FEMALE.includes(portrait.look)) &&
    portrait.outfit !== undefined &&
    PORTRAIT_OUTFITS.includes(portrait.outfit) &&
    typeof portrait.eyes === 'string' &&
    Object.hasOwn(PORTRAIT_EYES, portrait.eyes) &&
    (portrait.hijabColor === undefined || has('top', portrait.hijabColor))
  );
}

/** Any stored value, including an older save, as a valid config. Unknown colors fall back to the default. */
export function normalizeAvatar(value: unknown): AvatarConfigDto {
  const colors = defaultColors();
  const stored =
    value && typeof value === 'object' && 'colors' in value && value.colors && typeof value.colors === 'object'
      ? (value.colors as Record<string, unknown>)
      : {};
  for (const part of AVATAR_PARTS) if (has(part, stored[part])) colors[part] = stored[part];
  const portrait = value && typeof value === 'object' && 'portrait' in value ? value.portrait : undefined;
  return { schemaVersion: AVATAR_SCHEMA_VERSION, colors, ...(isValidPortrait(portrait) && { portrait }) };
}

/** A small seeded generator, so a member's starter look is the same on every device. */
function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A random look from the catalog. */
export function randomAvatar(random: () => number = Math.random): AvatarConfigDto {
  const colors = defaultColors();
  for (const part of AVATAR_PARTS) {
    const list = presetsFor(part);
    colors[part] = list[Math.floor(random() * list.length) % list.length].id;
  }
  return { schemaVersion: AVATAR_SCHEMA_VERSION, colors };
}

/**
 * The look a member has: their saved character, or a starter picked from an
 * opaque member identifier only (never name, age, sex, or scans), the same every time.
 */
export function memberAvatar({ memberId, avatar }: Pick<ProfileDto, 'memberId' | 'avatar'>): AvatarConfigDto {
  return avatar ? normalizeAvatar(avatar) : randomAvatar(seeded(hash(String(memberId))));
}

export function sameAvatar(a: AvatarConfigDto, b: AvatarConfigDto): boolean {
  const first = portraitOf(a);
  const second = portraitOf(b);
  return (
    AVATAR_PARTS.every((p) => a.colors[p] === b.colors[p]) &&
    first.look === second.look &&
    first.outfit === second.outfit &&
    first.eyes === second.eyes &&
    (first.hijabColor ?? DEFAULT_HIJAB_COLOR) === (second.hijabColor ?? DEFAULT_HIJAB_COLOR)
  );
}
