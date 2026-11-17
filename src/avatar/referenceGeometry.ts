import { isTiedHair, type ResolvedStyles } from './catalog';
import rawAtlas from './referenceSprites.json';

export type SpriteSource = keyof typeof rawAtlas;
export type SpriteRegion = 'head' | 'top' | 'legs' | 'shoes';
export type Foot = 0 | 1;
export type Paint =
  'ink' | 'skin' | 'hair' | 'hijab' | 'top' | 'crest' | 'pants' | 'socks' | 'shoes' | 'iris' | 'mouth' | 'beard';
type Point = readonly [x: number, y: number];
type Frame = {
  w: number;
  h: number;
  center: number;
  neck: number;
  waist: number;
  ankle: number;
  belt: Point;
  feet: Point;
  face: { eyes: readonly [Point, Point]; mouth: Point; jaw: Point };
  palette: readonly (readonly [SpriteRegion, Paint, string, number])[];
  pixels: string;
};

export const atlas = rawAtlas as unknown as Record<SpriteSource, Frame>;

export const ART_NECK = 82;
export const ART_WAIST = 129;
export const ART_ANKLE = 180;
export const ART_FLOOR = 211;
const ART_CENTER = 64;

const SOCK_TOP = {
  'ankle-socks': 173,
  'crew-socks': 161,
  'striped-socks': 160,
  'knee-highs': 146,
  'grip-socks': 175,
  'cushioned-socks': 168,
  'tab-socks': 175,
  'compression-socks': 147,
} as const satisfies Record<Exclude<ResolvedStyles['socks'], 'no-socks'>, number>;

export const sockTop = (style: keyof typeof SOCK_TOP) => SOCK_TOP[style];

function waistFit(source: SpriteSource, tailored: boolean) {
  const { belt } = atlas[source];
  return {
    center: (belt[0] + belt[1]) / 2,
    scale: (tailored ? 38 : 43) / (belt[1] - belt[0]),
  };
}

export function alignedAnkle(source: SpriteSource, side: Foot, tailored: boolean) {
  const { center, scale } = waistFit(source, tailored);
  return ART_CENTER + (atlas[source].feet[side] - center) * scale;
}

export function artworkGeometry(
  source: SpriteSource,
  region: SpriteRegion,
  tailored: boolean,
  shoe?: { side: Foot; x: number },
) {
  const { h, center, neck, waist, ankle, face, feet } = atlas[source];

  if (region === 'head') {
    const scale = 20 / (face.eyes[1][0] - face.eyes[0][0]);
    const jaw = source === 'lilac' || source === 'violetWrap' || source === 'paleWrap' ? ART_NECK - 13 : ART_NECK - 6;
    const y = jaw - face.jaw[1] * scale;
    return `translate(${ART_CENTER - face.jaw[0] * scale} ${y}) scale(${scale})`;
  }

  const fit = waistFit(source, tailored);
  const [start, end, top, bottom] = {
    top: [neck, waist, ART_NECK, ART_WAIST + 2],
    legs: [waist, ankle, ART_WAIST, ART_ANKLE],
    shoes: [ankle, h, ART_ANKLE - 2, ART_FLOOR],
  }[region];
  const scaleY = (bottom - top) / (end - start);
  const scaleX = region === 'shoes' ? 205 / h : fit.scale;
  const x = shoe ? shoe.x - feet[shoe.side] * scaleX : ART_CENTER - (region === 'shoes' ? center : fit.center) * scaleX;
  return `translate(${x} ${top - start * scaleY}) scale(${scaleX} ${scaleY})`;
}

export function pickHead(style: ResolvedStyles): SpriteSource {
  const { hair } = style;
  if (hair === 'sport-hijab') return 'violetWrap';
  if (hair === 'wrap-hijab') return 'lilac';
  if (hair === 'longline-hijab') return 'paleWrap';
  if (hair === 'high-bun') return 'teal';
  if (isTiedHair(hair) || hair === 'top-knot') return 'sideHead';
  if (hair === 'spikes') return 'silver';
  if (hair === 'buzz-cut' || hair === 'fade' || hair === 'shaved') return 'buzzHead';
  if (hair === 'waves') return 'cloud';
  if (hair === 'side-part') return 'sideHead';
  if (hair === 'locs' || hair === 'braids') return 'waveHead';
  return 'curlyHead';
}

export function pickTop(style: ResolvedStyles, tailored: boolean): SpriteSource {
  if (style.top === 'racerback-bra' || style.top === 'longline-tank') return 'teal';
  if (
    style.top === 'tank' ||
    style.top === 'tee' ||
    style.top === 'mesh-tee' ||
    style.top === 'raglan-top' ||
    style.top === 'sleeveless-hoodie'
  ) {
    return tailored ? 'teal' : 'silver';
  }
  if (style.top === 'track-jacket' || style.top === 'fitted-zip' || style.top === 'longline-training-top') {
    return style.top === 'fitted-zip' ? 'lilac' : 'cap';
  }
  if (style.top === 'zip-hoodie' || style.top === 'quarter-zip' || style.top === 'compression-top') {
    return tailored ? 'lilac' : 'cap';
  }
  if (style.top === 'sweatshirt' || style.top === 'varsity') return 'violet';
  return 'cloud';
}

export function pickLegs(style: ResolvedStyles, tailored: boolean): SpriteSource {
  switch (style.pants) {
    case 'shorts':
    case 'loose-training-shorts':
    case 'split-shorts':
    case 'liner-shorts':
    case 'bike-shorts':
      return tailored ? 'teal' : 'silver';
    case 'cargo':
    case 'warmup-pants':
      return tailored ? 'lilac' : 'cap';
    case 'track-pants':
    case 'tapered-joggers':
      return tailored ? 'lilac' : 'cloud';
    case 'high-rise-leggings':
      return 'amber';
    case 'capris':
      return 'lilac';
    default:
      return tailored ? 'paleWrap' : 'violet';
  }
}

export function pickShoes(style: ResolvedStyles, tailored: boolean): SpriteSource {
  switch (style.shoes) {
    case 'high-tops':
      return tailored ? 'violetWrap' : 'silver';
    case 'boots':
      return 'violet';
    case 'runners':
      return tailored ? 'teal' : 'cloud';
    case 'cushioned-runners':
      return tailored ? 'paleWrap' : 'teal';
    case 'lifters':
      return tailored ? 'amber' : 'cap';
    case 'flat-lifters':
      return 'lilac';
    case 'slip-ons':
    case 'canvas':
      return 'paleWrap';
    case 'cross-trainers':
      return 'amber';
    default:
      return tailored ? 'lilac' : 'cloud';
  }
}
