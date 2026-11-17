/*
 * The HD "Casual" figure: one character, one pose, drawn from nine cropped
 * PNG layers on a 1024 × 1536 canvas (public/avatar/hd-casual-layers/, built
 * by scripts/build-hd-casual.mjs). The geometry below mirrors that folder's
 * manifest.json; a unit test keeps them in step.
 */

/** A color slot the member can change. Each tints one or more layers. */
export type HdPart = 'skin' | 'hair' | 'top' | 'bottom' | 'shoes';

export interface HdLayer {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** The color slot that tints this layer; null keeps its painted colors. */
  part: HdPart | null;
}

export const HD_CANVAS = { width: 1024, height: 1536 } as const;

/** Draw order, back to front. */
export const HD_LAYERS: readonly HdLayer[] = [
  { id: 'backpack-rear', x: 223, y: 327, width: 188, height: 264, part: null },
  { id: 'body', x: 251, y: 281, width: 503, height: 1176, part: 'skin' },
  { id: 'cargo-pants', x: 279, y: 706, width: 406, height: 631, part: 'bottom' },
  { id: 'shoe-left', x: 265, y: 1306, width: 198, height: 196, part: 'shoes' },
  { id: 'shoe-right', x: 503, y: 1294, width: 275, height: 189, part: 'shoes' },
  { id: 'hoodie', x: 214, y: 247, width: 545, height: 555, part: 'top' },
  { id: 'head', x: 432, y: 82, width: 166, height: 243, part: 'skin' },
  { id: 'hair', x: 365, y: 23, width: 266, height: 227, part: 'hair' },
  { id: 'backpack-straps', x: 339, y: 313, width: 323, height: 441, part: null },
];

/** Where each layer's PNG is served (the app runs under /LevelUP/ on GitHub Pages). */
export const hdLayerUrl = (id: string): string => `${import.meta.env.BASE_URL}avatar/hd-casual-layers/${id}.png`;

/** viewBox per crop: the whole figure, or the head and shoulders for small frames. */
export const HD_VIEW = {
  full: '180 10 640 1510',
  portrait: '330 10 360 360',
} as const;
export type AvatarCrop = keyof typeof HD_VIEW;
