/*
 * The character catalog: one HD figure (see hdFigure.ts) whose skin, hair,
 * top, pants and shoes take a color preset. A saved character stores preset
 * IDs only, never raw colors or markup, so the renderer only ever paints
 * bundled colors. Older saves (schema 1, the drawn characters) still load:
 * they fall back to the default look, keeping any skin or hair color that
 * still exists.
 */
import type { AvatarConfigDto, AvatarPart, ProfileDto } from '../api/types';
import palettes from './palettes.hd.json';

export type { AvatarConfigDto, AvatarPart };

export const AVATAR_SCHEMA_VERSION = 2;

/** Customizer order: the face first, then clothes top to bottom. */
export const AVATAR_PARTS: readonly AvatarPart[] = ['skin', 'hair', 'top', 'bottom', 'shoes'];

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

/** The catalog's default look: the figure as drawn. */
export const defaultAvatar = (): AvatarConfigDto => ({ schemaVersion: AVATAR_SCHEMA_VERSION, colors: defaultColors() });

/** True when `value` is a config this catalog can save as is. */
export function isValidAvatar(value: unknown): value is AvatarConfigDto {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<AvatarConfigDto>;
  if (v.schemaVersion !== AVATAR_SCHEMA_VERSION || !v.colors || typeof v.colors !== 'object') return false;
  const keys = Object.keys(v.colors);
  if (keys.length !== AVATAR_PARTS.length) return false;
  return AVATAR_PARTS.every((p) => has(p, (v.colors as Record<string, unknown>)[p]));
}

/** Any stored value, including an older save, as a valid config. Unknown colors fall back to the default. */
export function normalizeAvatar(value: unknown): AvatarConfigDto {
  const colors = defaultColors();
  const stored =
    value && typeof value === 'object' && 'colors' in value && value.colors && typeof value.colors === 'object'
      ? (value.colors as Record<string, unknown>)
      : {};
  for (const part of AVATAR_PARTS) if (has(part, stored[part])) colors[part] = stored[part];
  return { schemaVersion: AVATAR_SCHEMA_VERSION, colors };
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
  return AVATAR_PARTS.every((p) => a.colors[p] === b.colors[p]);
}
