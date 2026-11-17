import { useId } from 'react';
import type { AvatarConfigDto, AvatarPaint, ColorPart, ResolvedStyles } from './catalog';
import { colorIdFor, isHijab } from './catalog';
import {
  artworkGeometry,
  ART_ANKLE,
  ART_WAIST,
  atlas,
  sockTop,
  type Foot,
  type Paint,
  type SpriteRegion,
  type SpriteSource,
} from './referenceGeometry';
import { PantsDetails, ShoeDetails, TopDetails } from './SpriteDetails';

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
        // Avoid loose hair pixels left in the shoulders of the studio top.
        const studioCollar = source === 'teal' && region === 1 && y < neck + 12;
        const left = studioCollar ? 17 : 0;
        const right = studioCollar ? 42 : stride;
        for (let x = left; x < right;) {
          const index = indices.charCodeAt(offset + x);
          let endX = x + 1;
          while (endX < right && indices.charCodeAt(offset + endX) === index) endX++;
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
    if (!rows[index].length) return;
    // Pink cheek highlights were picked up by the pale scarf's fabric mask.
    const cheek = source === 'paleWrap' && paint === 'hijab' && (color === 'f1bcc1' || color === 'b07b93');
    output[region].push({
      paint: cheek ? 'skin' : paint,
      color: `#${color}`,
      shade: cheek ? (color === 'f1bcc1' ? 11 : -28) : shade,
      path: rows[index].join(''),
    });
  });
  CACHE.set(source, output);
  return output;
}

const PALETTES: Record<SpriteSource, Partial<Record<Paint, string>>> = {
  silver: { hair: 'silver', top: 'burgundy', pants: 'charcoal', socks: 'off-white', shoes: 'teal' },
  cloud: { hair: 'auburn', top: 'cream', pants: 'graphite', socks: 'off-white', shoes: 'brick' },
  teal: { hair: 'auburn', top: 'teal', pants: 'slate', socks: 'off-white', shoes: 'teal' },
  cap: { hair: 'espresso', top: 'charcoal', pants: 'slate', socks: 'charcoal', shoes: 'teal' },
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
  // Exposed ankles are skin until the selected sock is painted over them.
  const bareAnkle = paint === 'socks';
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
  config,
  paint,
  styles,
  hood,
  tailored,
  shoe,
  withSocks,
}: {
  source: SpriteSource;
  region: SpriteRegion;
  config: AvatarConfigDto;
  paint: AvatarPaint;
  styles: ResolvedStyles;
  hood?: 'raised';
  tailored: boolean;
  shoe?: { side: Foot; x: number };
  withSocks?: boolean;
}) {
  const clip = useId();
  const detail = useId();
  const cuffs = useId();
  const frame = atlas[source];
  const middle = (frame.feet[0] + frame.feet[1]) / 2;
  const entries = layers(source)[region];
  const firstHijab = entries.findIndex(({ paint }) => paint === 'hijab');
  const firstSkin = entries.findIndex(({ paint }) => paint === 'skin');
  const fabric = region === 'top' ? 'top' : 'pants';
  const [beltStart, beltEnd] = frame.belt;
  const waistCenter = (beltStart + beltEnd) / 2;
  const legs = region === 'legs';
  const top = region === 'top';
  const capris = legs && styles.pants === 'capris';
  const cuffHeight = styles.socks === 'no-socks' ? ART_ANKLE : sockTop(styles.socks);
  const ankleScale = (frame.ankle - frame.waist) / (ART_ANKLE - ART_WAIST);
  const cuff = frame.waist + (cuffHeight - ART_WAIST) * ankleScale;
  const hem = frame.waist + (frame.ankle - frame.waist) * 0.78;
  const sleeves = top && ['tee', 'mesh-tee', 'raglan-top'].includes(styles.top);
  const shirt = top && (styles.top === 'longline-tank' || (tailored && styles.top === 'tank'));
  const detailShape =
    top || legs
      ? entries
          .filter(({ paint }) => paint === fabric || (top && paint === 'skin' && (sleeves || shirt)))
          .map(({ path }) => path)
          .join('')
      : '';
  const sockPixels =
    legs && withSocks && styles.socks !== 'no-socks'
      ? entries
          .filter(({ paint }) => paint === 'skin' || paint === 'socks' || (capris && paint === 'pants'))
          .map(({ path }) => path)
          .join('')
      : '';
  const cuffStart = capris ? Math.max(hem, cuff) : cuff;
  const shoeOrHeadClip = shoe || (region === 'head' && (hood || source === 'teal'));
  return (
    <g transform={artworkGeometry(source, region, tailored, shoe)} shapeRendering="crispEdges">
      {shoeOrHeadClip && (
        <clipPath id={clip}>
          {shoe ? (
            <rect
              x={shoe.side === 0 ? 0 : middle}
              y={frame.ankle}
              width={shoe.side === 0 ? middle : frame.w - middle}
              height={frame.h - frame.ankle}
            />
          ) : hood ? (
            <rect x="0" y="0" width={frame.w} height={frame.neck - 5} />
          ) : (
            // The studio reference has loose hair below its bun.
            <path d={`M0 0H${frame.w}V74H43V67H39V59H35V49H29V43H0Z`} />
          )}
        </clipPath>
      )}
      <g clipPath={shoeOrHeadClip ? `url(#${clip})` : undefined}>
        {entries.map((layer, i) => (
          <path
            key={i}
            fill={fillFor(
              layer.paint === 'hijab' && hood
                ? { ...layer, paint: 'top' }
                : layer.paint === 'hair' && styles.hair === 'shaved' && region === 'head'
                  ? { ...layer, paint: 'skin', color: paint.skin }
                  : layer,
              source,
              config,
              paint,
            )}
            d={layer.path}
            data-feature={layer.paint === 'iris' ? 'iris' : undefined}
            data-paint={i === firstHijab && !hood ? 'hijab-fabric' : undefined}
            data-art-detail={i === firstSkin && firstHijab >= 0 && !hood ? 'hijab-face' : undefined}
          />
        ))}
        {region === 'shoes' &&
          (shoe ? [frame.feet[shoe.side]] : frame.feet).map((x, i) => (
            <g key={i} transform={`translate(${x} ${frame.ankle}) scale(${(frame.h - frame.ankle) / 28})`}>
              <ShoeDetails style={styles.shoes} paint={paint} />
            </g>
          ))}
      </g>
      {region === 'head' && styles.hair === 'fade' && !hood && (
        <path d="M16 44h8v3h-8Zm49 0h8v3h-8Z M19 39h7v2h-7Zm45 0h7v2h-7Z" fill={paint.hairLight} />
      )}
      {region === 'head' && styles.hair === 'tapered-curls' && !hood && (
        <path d="M28 57h6v5h-6Zm55 0h6v5h-6Z" fill={paint.hairLight} />
      )}
      {(top || legs) && (
        <>
          <clipPath id={detail}>
            <path d={detailShape} />
          </clipPath>
          <g clipPath={`url(#${detail})`}>
            {capris && <rect y={hem} width={frame.w} height={frame.ankle - hem} fill={paint.skin} />}
            <g
              transform={`translate(${waistCenter} ${top ? frame.neck : frame.waist}) scale(${(beltEnd - beltStart) / 43} ${top ? (frame.waist - frame.neck) / 47 : (frame.ankle - frame.waist) / 51})`}
            >
              {sleeves && <path d="M-42 0h84v19H-42Z" fill={paint.tank} />}
              {shirt && <path d="M-15 31h30v16h-30Z" fill={paint.tank} />}
              {top ? (
                <TopDetails style={styles.top} paint={paint} />
              ) : (
                <PantsDetails style={styles.pants} paint={paint} />
              )}
            </g>
          </g>
        </>
      )}
      {sockPixels && (
        <>
          <clipPath id={cuffs}>
            <path d={sockPixels} />
          </clipPath>
          <g clipPath={`url(#${cuffs})`}>
            <rect
              data-paint={styles.shoes === 'barefoot' ? undefined : 'sock-fabric'}
              y={cuffStart}
              width={frame.w}
              height={frame.ankle - cuffStart}
              fill={paint.socks}
            />
            {(styles.socks === 'striped-socks' || styles.socks === 'knee-highs') && (
              <rect y={capris ? Math.max(hem, cuff + 3) : cuff + 3} width={frame.w} height="2" fill={paint.sockTrim} />
            )}
          </g>
        </>
      )}
    </g>
  );
}

// Accessories that are not in every reference head are attached over the face.
export function ReferenceFace({
  styles,
  paint: p,
  source,
  tailored,
}: {
  styles: ResolvedStyles;
  paint: AvatarPaint;
  source: SpriteSource;
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
    <g transform={artworkGeometry(source, 'head', tailored)}>
      <g data-style-layer="face" data-variant={styles.face}>
        {styles.face !== 'smile' && (
          <path
            data-feature="smile"
            d={styles.face === 'grin' ? 'M-4 -1h8l-2 3h-4z' : 'M-3 0h6v1h-6z'}
            transform={`translate(${mx} ${my}) scale(${scale})`}
            fill={styles.face === 'grin' ? p.trim : p.mouth}
            stroke={styles.face === 'grin' ? p.mouth : undefined}
            strokeWidth={1}
          />
        )}
        {styles.face === 'focused' && (
          <path
            d={`M${lx - 4 * scale} ${ly - 5 * scale}l${7 * scale} ${2 * scale}M${rx - 3 * scale} ${ry - 3 * scale}l${7 * scale} ${-2 * scale}`}
            stroke={p.outline}
            strokeWidth={scale}
          />
        )}
      </g>
      {!covered && beardPath && (
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
