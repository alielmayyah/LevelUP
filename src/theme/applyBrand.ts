import { brand as defaultBrand, type AppBrand } from '../brand.config';

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

/**
 * Applies the brand to the page: Ionic's primary and secondary colors (with
 * the variants Ionic expects), the accent token, and the document title.
 * Inline styles on <html> win over both the light and dark palettes.
 */
export function applyBrand(b: AppBrand = defaultBrand, root: HTMLElement = document.documentElement): void {
  setIonColor(root, 'primary', b.colors.primary);
  setIonColor(root, 'secondary', b.colors.secondary);
  const accent = parseHex(b.colors.accent, 'accent');
  root.style.setProperty('--lu-accent', toHex(accent));
  root.style.setProperty('--lu-accent-contrast', toHex(contrastRgb(accent)));
  document.title = b.name;
}
