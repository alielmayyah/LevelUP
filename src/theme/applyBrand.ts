import { brand as defaultBrand, gym as defaultGym, type AppBrand, type GymConfig } from '../brand.config';

type Rgb = [number, number, number];

const BLACK: Rgb = [0, 0, 0];
const WHITE: Rgb = [255, 255, 255];

function parseHex(color: string, name: string): Rgb {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) throw new Error(`brand.colors.${name} must be a hex color like #6c3cf0, got "${color}"`);
  const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
}

const toHex = (rgb: Rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
const toRgbList = (rgb: Rgb) => rgb.join(', ');

/** Moves `weight` of the way from `from` to `to`, like Ionic's color generator. */
const mix = (from: Rgb, to: Rgb, weight: number): Rgb => from.map((c, i) => c + (to[i] - c) * weight) as Rgb;

function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const contrastRatio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function contrastRgb(rgb: Rgb): Rgb {
  return contrastRatio(rgb, WHITE) >= contrastRatio(rgb, BLACK) ? WHITE : BLACK;
}

/** Black or white, whichever reads better on `color`. */
export const contrastColor = (color: string): string => toHex(contrastRgb(parseHex(color, 'color')));

function setIonColor(root: HTMLElement, name: string, color: string): void {
  const rgb = parseHex(color, name);
  const contrast = contrastRgb(rgb);
  const set = (suffix: string, value: string) => root.style.setProperty(`--ion-color-${name}${suffix}`, value);
  set('', toHex(rgb));
  set('-rgb', toRgbList(rgb));
  set('-contrast', toHex(contrast));
  set('-contrast-rgb', toRgbList(contrast));
  set('-shade', toHex(mix(rgb, BLACK, 0.12)));
  set('-tint', toHex(mix(rgb, WHITE, 0.1)));
}

/*
 * The gym brand layer (ui-standards → Colors). One brand color in, the six
 * --lu-brand* tokens out, for each theme. Values are checked against the
 * fixed neutrals so every pairing keeps its contrast.
 */

export type BrandTheme = 'light' | 'dark';

export interface BrandLayer {
  brand: string;
  brandStrong: string;
  brandSoft: string;
  brandTint: string;
  onBrand: string;
  gradient: string;
}

const NEUTRALS: Record<BrandTheme, { surface1: Rgb; surface2: Rgb }> = {
  dark: { surface1: [0x15, 0x12, 0x1f], surface2: [0x1d, 0x19, 0x29] },
  light: { surface1: WHITE, surface2: [0xf1, 0xee, 0xf8] },
};
const DARK_LABEL: Rgb = [0x0c, 0x0a, 0x14];

/** Moves `from` toward `to` in 1% steps until `ok` holds (or `to` is reached). */
function stepUntil(from: Rgb, to: Rgb, ok: (c: Rgb) => boolean): { color: Rgb; weight: number } {
  for (let w = 0; w <= 1.0001; w += 0.01) {
    const c = mix(from, to, w).map(Math.round) as Rgb;
    if (ok(c)) return { color: c, weight: w };
  }
  return { color: to, weight: 1 };
}

/** Darkening past this share toward black muddies the brand: use a dark label on it instead. */
const MAX_DARKEN_FOR_WHITE = 0.15;

export function brandLayer(color: string, theme: BrandTheme): BrandLayer {
  const base = parseHex(color, 'brand');
  const { surface1, surface2 } = NEUTRALS[theme];

  // Filled buttons: white on a slightly darker brand, or a dark label on the brand itself.
  const forWhite = stepUntil(base, BLACK, (c) => contrastRatio(c, WHITE) >= 4.5);
  const whiteFits = forWhite.weight <= MAX_DARKEN_FOR_WHITE;
  const strong = whiteFits ? forWhite.color : base;
  const onBrand = whiteFits ? WHITE : DARK_LABEL;

  // Brand-colored text and icons: 4.5:1 on surface-2.
  const softTarget = theme === 'dark' ? WHITE : BLACK;
  const soft = stepUntil(base, softTarget, (c) => contrastRatio(c, surface2) >= 4.5).color;

  // Graphics (rings, the active tab): 3:1 on surface-2.
  const graphic = stepUntil(base, softTarget, (c) => contrastRatio(c, surface2) >= 3).color;

  const tint = mix(surface1, base, theme === 'dark' ? 0.2 : 0.12).map(Math.round) as Rgb;

  return {
    brand: toHex(graphic),
    brandStrong: toHex(strong),
    brandSoft: toHex(soft),
    brandTint: toHex(tint),
    onBrand: toHex(onBrand),
    gradient: `linear-gradient(135deg, ${toHex(soft)} 0%, ${toHex(strong)} 100%)`,
  };
}

const layerCss = (l: BrandLayer) =>
  [
    `--lu-brand: ${l.brand};`,
    `--lu-brand-strong: ${l.brandStrong};`,
    `--lu-brand-soft: ${l.brandSoft};`,
    `--lu-brand-tint: ${l.brandTint};`,
    `--lu-on-brand: ${l.onBrand};`,
    `--lu-brand-gradient: ${l.gradient};`,
  ].join(' ');

const STYLE_ID = 'lu-gym-brand';

/**
 * Writes a gym's brand layer for both themes as a <style> element (inline
 * styles can't differ per theme). null removes it, so tokens.css's LevelUP
 * violet applies.
 */
export function applyGymBrand(color: string | null, doc: Document = document): void {
  doc.getElementById(STYLE_ID)?.remove();
  if (!color) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent =
    `:root { ${layerCss(brandLayer(color, 'light'))} }
` + `:root.ion-palette-dark { ${layerCss(brandLayer(color, 'dark'))} }`;
  doc.head.appendChild(style);
}

/**
 * Applies the brand to the page: Ionic's primary and secondary colors (with
 * the variants Ionic expects), the accent token, and the document title.
 * Inline styles on <html> win over both the light and dark palettes.
 */
export function applyBrand(
  b: AppBrand = defaultBrand,
  root: HTMLElement = document.documentElement,
  g: GymConfig = defaultGym,
): void {
  applyGymBrand(g.brand, root.ownerDocument);
  setIonColor(root, 'primary', b.colors.primary);
  setIonColor(root, 'secondary', b.colors.secondary);
  const accent = parseHex(b.colors.accent, 'accent');
  root.style.setProperty('--lu-accent', toHex(accent));
  root.style.setProperty('--lu-accent-contrast', toHex(contrastRgb(accent)));
  document.title = b.name;
}
