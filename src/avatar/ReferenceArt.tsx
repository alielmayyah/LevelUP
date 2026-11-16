import { useId } from 'react';
import type { AvatarConfigDto, AvatarPaint, ColorPart, ResolvedStyles } from './catalog';
import { colorIdFor, isHijab } from './catalog';
import {
  artworkGeometry,
  atlas,
  type Foot,
  type Paint,
  type SpriteRegion,
  type SpriteSource,
} from './referenceGeometry';

type Layer = { paint: Paint; color: string; shade: number; path: string };
const CACHE = new Map<SpriteSource, Record<SpriteRegion, Layer[]>>();

function layers(source: SpriteSource) {
  const cached = CACHE.get(source);
  if (cached) return cached;

  const { w, h, neck, waist, ankle, palette, pixels } = atlas[source];
  const indices = atob(pixels);
  const rows = palette.map(() => [] as string[]);
  let start = 0;
  let offset = 0;
  [neck, waist, ankle, h]
    .map((y) => Math.min(y, h))
    .forEach((endY, region) => {
      const step = region === 0 && !source.endsWith('Head') ? 1 : 2;
      const stride = Math.ceil(w / step);
      for (let y = start; y < endY; y += step) {
        const height = Math.min(step, endY - y);
        for (let x = 0; x < stride;) {
          const index = indices.charCodeAt(offset + x);
          let endX = x + 1;
          while (endX < stride && indices.charCodeAt(offset + endX) === index) endX++;
          const length = Math.min(endX * step, w) - x * step;
          if (index) rows[index - 1].push(`M${x * step} ${y}h${length}v${height}h-${length}z`);
          x = endX;
        }
        offset += stride;
      }
      start = endY;
    });
  const output: Record<SpriteRegion, Layer[]> = { head: [], top: [], legs: [], shoes: [] };
  palette.forEach(([region, paint, color, shade], index) => {
    if (rows[index].length) output[region].push({ paint, color: `#${color}`, shade, path: rows[index].join('') });
  });
  CACHE.set(source, output);
  return output;
}

const PALETTES: Record<SpriteSource, Partial<Record<Paint, string>>> = {
  silver: { hair: 'silver', top: 'burgundy', pants: 'charcoal', socks: 'off-white', shoes: 'teal' },
  cloud: { hair: 'auburn', top: 'cream', pants: 'graphite', socks: 'off-white', shoes: 'brick' },
  teal: { hair: 'auburn', top: 'teal', pants: 'slate', socks: 'off-white', shoes: 'teal' },
  cap: { hair: 'espresso', top: 'charcoal', pants: 'slate', socks: 'charcoal', shoes: 'amber' },
  violet: { hair: 'indigo', top: 'orchid', pants: 'aubergine', socks: 'off-white', shoes: 'violet' },
  lilac: { hijab: 'plum', top: 'orchid', pants: 'aubergine', socks: 'off-white', shoes: 'violet' },
  violetWrap: { hijab: 'plum', top: 'plum', pants: 'aubergine', socks: 'off-white', shoes: 'violet' },
  paleWrap: { hijab: 'plum', top: 'cream', pants: 'charcoal', socks: 'off-white', shoes: 'off-white' },
  amber: { hijab: 'navy', top: 'amber', pants: 'graphite', socks: 'charcoal', shoes: 'amber' },
  curlyHead: { hair: 'espresso' },
  buzzHead: { hair: 'brown' },
  sideHead: { hair: 'brown' },
  waveHead: { hair: 'indigo' },
};

const COLOR_PART = {
  skin: 'skin',
  hair: 'hair',
  hijab: 'hijab',
  top: 'tank',
  pants: 'shorts',
  socks: 'socks',
  shoes: 'shoes',
  beard: 'beard',
} as const satisfies Record<Exclude<Paint, 'ink' | 'iris' | 'mouth'>, ColorPart>;
function fillFor(layer: Layer, source: SpriteSource, config: AvatarConfigDto, p: AvatarPaint) {
  const { paint, shade, color } = layer;
  if (paint === 'ink') return color;
  if (paint === 'iris') return config.colors.eyes === 'dark-brown' ? color : shade < 0 ? p.outline : p.eyes;
  if (paint === 'mouth') {
    if (config.styles?.face && config.styles.face !== 'smile') return p.skin;
    return config.colors.skin === 'light' ? color : p.mouth;
  }
  if (paint === 'beard' && config.colors.beard && config.colors.beard !== 'match-hair')
    return shade < 0 ? p.beardShade : p.beard;
  if (paint === 'beard') return color;
  const original = paint === 'skin' ? 'light' : PALETTES[source][paint];
  const part = COLOR_PART[paint];
  const bareAnkle = paint === 'socks' && config.styles?.socks === 'no-socks';
  if (!bareAnkle && colorIdFor(config, part) === original) return color;
  const tint = bareAnkle ? p.skin : p[part];
  const fraction = Math.min(62, Math.abs(shade) * (shade < 0 ? 0.6 : 0.45));
  const target = shade < 0 ? p.outline : p.trim;
  const blend = [1, 3, 5]
    .map((i) => {
      const a = parseInt(tint.slice(i, i + 2), 16);
      const b = parseInt(target.slice(i, i + 2), 16);
      return Math.round(a + ((b - a) * fraction) / 100)
        .toString(16)
        .padStart(2, '0');
    })
    .join('');
  return `#${blend}`;
}

export function ReferenceLayer({
  source,
  region,
  complete,
  config,
  paint,
  hood,
  tailored,
  shoe,
}: {
  source: SpriteSource;
  region: SpriteRegion;
  complete: boolean;
  config: AvatarConfigDto;
  paint: AvatarPaint;
  hood?: 'raised' | 'behind';
  tailored: boolean;
  shoe?: { side: Foot; x: number };
}) {
  const clip = useId();
  const frame = atlas[source];
  const middle = (frame.feet[0] + frame.feet[1]) / 2;
  const entries = layers(source)[region].filter((layer) => hood !== 'behind' || layer.paint === 'hijab');
  const firstHijab = entries.findIndex(({ paint }) => paint === 'hijab');
  const firstSkin = entries.findIndex(({ paint }) => paint === 'skin');
  const firstSock = entries.findIndex(({ paint }) => paint === 'socks');
  return (
    <g transform={artworkGeometry(source, region, complete, tailored, shoe)} shapeRendering="crispEdges">
      {shoe && (
        <clipPath id={clip}>
          <rect
            x={shoe.side === 0 ? 0 : middle}
            y={frame.ankle}
            width={shoe.side === 0 ? middle : frame.w - middle}
            height={frame.h - frame.ankle}
          />
        </clipPath>
      )}
      <g clipPath={shoe ? `url(#${clip})` : undefined}>
        {entries.map((layer, i) => (
          <path
            key={i}
            fill={fillFor(hood && layer.paint === 'hijab' ? { ...layer, paint: 'top' } : layer, source, config, paint)}
            d={layer.path}
            data-feature={layer.paint === 'iris' ? 'iris' : undefined}
            data-paint={i === firstHijab && !hood ? 'hijab-fabric' : i === firstSock ? 'sock-fabric' : undefined}
            data-art-detail={i === firstSkin && firstHijab >= 0 && !hood ? 'hijab-face' : undefined}
          />
        ))}
      </g>
    </g>
  );
}

// Accessories that are not in every reference head are attached over the face.
export function ReferenceFace({
  styles,
  paint: p,
  source,
  complete,
  tailored,
}: {
  styles: ResolvedStyles;
  paint: AvatarPaint;
  source: SpriteSource;
  complete: boolean;
  tailored: boolean;
}) {
  const {
    eyes: [[lx, ly], [rx, ry]],
    mouth: [mx, my],
  } = atlas[source].face;
  const scale = (rx - lx) / 19;
  const width = 11 * scale;
  const height = 8.5 * scale;
  const radius =
    styles.glasses === 'round-glasses' ? height / 2 : styles.glasses === 'sport-glasses' ? height / 3 : 1.2;
  const covered = isHijab(styles.hair);
  const beardPath = styles.beard === 'clean-shaven' ? undefined : BEARDS[styles.beard];
  return (
    <g transform={artworkGeometry(source, 'head', complete, tailored)}>
      <g data-style-layer="face" data-variant={styles.face}>
        {styles.face !== 'smile' && (
          <path
            data-feature="smile"
            d={styles.face === 'grin' ? `M-4 -1h8l-2 3h-4z` : `M-3 0h6v1h-6z`}
            transform={`translate(${mx} ${my}) scale(${scale})`}
            fill={styles.face === 'grin' ? p.trim : p.mouth}
            stroke={styles.face === 'grin' ? p.mouth : undefined}
            strokeWidth={1}
          />
        )}
      </g>
      {!covered && beardPath && source !== 'cap' && (
        <g
          data-style-layer="beard"
          data-variant={styles.beard}
          transform={`translate(${mx - 9 * scale} ${my - 18 * scale}) scale(${scale})`}
        >
          <path
            data-paint="beard-hair"
            fill={styles.beard === 'stubble' ? p.stubble : p.beard}
            d={beardPath}
            opacity={styles.beard === 'stubble' ? '.65' : '.85'}
          />
        </g>
      )}
      {source === 'cap' && <g data-style-layer="beard" data-variant={styles.beard} />}
      {styles.glasses !== 'no-glasses' && (
        <g
          data-style-layer="glasses"
          data-variant={styles.glasses}
          stroke={p.outline}
          strokeWidth={1.4 * scale}
          fill="none"
        >
          <rect x={lx - width / 2} y={ly - height / 2} width={width} height={height} rx={radius} />
          <rect x={rx - width / 2} y={ry - height / 2} width={width} height={height} rx={radius} />
          <path d={`M${lx + width / 2} ${ly - scale}L${rx - width / 2} ${ry - scale}`} />
        </g>
      )}
    </g>
  );
}

const BEARDS = {
  stubble: 'M1 19h2v2H1zm3 3h2v1H4zm4 1h4v1H8zm6-1h2v1h-2zm3-3h2v2h-2z',
  mustache: 'M4 16h3l2 1 2-1h4v2h-4l-2 1-2-1H4z',
  goatee: 'M4 16h11v2H4zm1 4h9l-2 4H8z',
  'short-beard': 'M0 17h2l3 3h9l3-3h2v3l-4 4H5l-5-4z',
  'full-beard': 'M0 16h3l2 3h9l2-3h3v6l-4 5H5l-5-5z',
  'chin-strap': 'M0 17h1l3 5h11l3-5h1v3l-3 4H4l-4-4z',
  'fade-beard': 'M1 19h2l3 2h7l3-2h2l-3 5H5z',
  'chin-tuft': 'M6 21h7l-2 3H8z',
  'boxed-beard': 'M0 16h2l2 3h11l2-3h2v6l-3 2H4l-4-2z M6 16h7v2H6z',
  'circle-beard': 'M5 16h9l2 3-2 5H5l-2-5zM6 18l-1 2 1 1h7l1-1-1-2z',
} satisfies Record<Exclude<ResolvedStyles['beard'], 'clean-shaven'>, string>;
