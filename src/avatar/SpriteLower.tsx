import type { AvatarPaint, ResolvedStyles } from './catalog';

type Socks = ResolvedStyles['socks'];

const SOCK_TOP = {
  'ankle-socks': 185,
  'crew-socks': 174,
  'striped-socks': 175,
  'knee-highs': 162,
  'grip-socks': 183,
  'cushioned-socks': 179,
  'tab-socks': 187,
  'compression-socks': 161,
} as const satisfies Record<Exclude<Socks, 'no-socks'>, number>;

export function SpriteSocks({ style, paint: p, crop }: { style: Socks; paint: AvatarPaint; crop: boolean }) {
  if (style === 'no-socks' && !crop) return null;
  const y = style === 'no-socks' ? 167 : SOCK_TOP[style];
  const stripe = style === 'striped-socks' || style === 'knee-highs';
  const neck = style === 'tab-socks' ? 'M36 188v-3h5v3' : '';
  const outline = `M36 ${y}l9 1 11-2-2 ${190 - y} -2 8-6 6H32l-5-3 1-5 7-5Z ${neck}`;
  const skin = style === 'no-socks';
  const side = (
    <>
      <path
        d={outline}
        fill={skin ? p.skin : p.socks}
        stroke={p.outline}
        strokeWidth="2.5"
        data-paint={skin ? undefined : 'sock-fabric'}
      />
      <path d={`M51 ${y + 3}h4l-3 ${188 - y}-1 10-6 6H34l-4-3 12-1 5-6Z`} fill={skin ? p.skinShade : p.sockShade} />
      {!skin && <path d={`M37 ${y + 2}l9 1 9-2v3l-9 2-9-1Z`} fill={stripe ? p.sockTrim : p.sockShade} />}
      {stripe && <path d={`M37 ${y + 7}l8 1 9-2v2l-9 2-8-1Z`} fill={p.sockTrim} />}
      {style === 'grip-socks' && <path d="M33 200h3v2h-3Zm6 0h3v2h-3Zm6-2h3v2h-3Z" fill={p.sockTrim} />}
      {style === 'compression-socks' && <path d="M43 172h2l-2 19h-2Z" fill={p.sockTrim} opacity=".65" />}
    </>
  );
  return (
    <g data-style-layer="socks" data-variant={style}>
      {side}
      <g transform="translate(128 0) scale(-1 1)">{side}</g>
    </g>
  );
}

export function SpriteFeet({ paint: p }: { paint: AvatarPaint }) {
  const side = (
    <>
      <path
        d="M76 180h11v11l5 4 9 1 7 3-1 5-4 2H79l-5-4Z"
        fill={p.skin}
        stroke={p.outline}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M78 197l7 2h21v4l-5 3H79l-4-3Z M99 198v4m5-3v3" fill={p.skinShade} />
      <path d="M85 195h8l6 3H86Z" fill={p.skinGlow} />
    </>
  );
  return (
    <>
      <g transform="translate(124 0) scale(-.96 1)">{side}</g>
      {side}
    </>
  );
}
