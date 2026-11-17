import type { AvatarPaint, ResolvedStyles, WOMEN_HAIR } from './catalog';

export function RaisedHood({ paint: p }: { paint: AvatarPaint }) {
  return (
    <g data-art-detail="raised-hood" shapeRendering="crispEdges">
      <path d="M38 81v-6h4V53h4V42h5v-7h7v-4h16v2h7v5h5v7h5v12h3v17h4v7H83l-7 6H55l-6-6Z" fill={p.outline} />
      <path d="M42 79v-4h3V54h4V43h5v-6h6v-3h14v2h6v5h5v7h4v10h3v17h3v4H82l-7 5H56l-6-5Z" fill={p.tank} />
      <path d="M48 70V55h4V45h5v-6h7v-3h9v2h6v5h5v7h4v10h3v13l-7 5h-9l-4 4H59l-4-4h-5Z" fill={p.topShade} />
      <path d="M50 52h4v-7h5v-5h7v-3h8v3h-6v4h-7v4h-5v8h-6Z" fill={p.topLight} />
      <path d="M46 77h7l6 5h12l7-5h11v2H82l-7 5H56l-6-5h-4Z" fill={p.topLight} />
      <path d="M56 80h2v12h-2Zm17 0h2v10h-2Z" fill={p.topTrim} />
    </g>
  );
}

type TiedStyle = (typeof WOMEN_HAIR)[number] | 'top-knot' | 'locs' | 'braids';
const TIED_HAIR = {
  'high-ponytail': ['M75 29h9v4h6v8h5v19h4v26h-5v9H81v-9h4V64h-4V48h-6Z', 'M83 36h4v7h5v18h4v20h-4V62h-4V47h-5Z'],
  'braided-ponytail': [
    'M78 28h10v7h6v9h4v14h3v10h-3v13h3v10h-4v9H85v-9h3V74h-4V58h-4V47h-5Z',
    'M85 34h5v8h-5Zm3 13h7v7h-7Zm3 13h7v6h-7Zm0 13h6v6h-6Zm-2 13h8v6h-8Z',
  ],
  'low-bun': ['M76 59h13v4h8v7h3v11h-6v6H80v-6h-6V67h2Z', 'M85 64h5v4h6v7h-5v-5h-6Z'],
  puff: ['M48 31V20h4v-7h8v-5h13v4h7v6h4v10h-5v6H57v-3Z', 'M53 23v-6h7v-5h10v4h-9v6h-5v4h-3Zm14-2h8v4h-8Z'],
  'double-braids': [
    'M41 43h7v14h-3v15h-4v12h-4v9H27v-9h3V70h4V56h4Zm42 0h7v13h4v14h4v14h3v9H91v-9h-4V72h-4V57h-3Z',
    'M39 57h5v6h-5Zm-3 11h5v6h-5Zm-4 12h5v6h-5Zm53-23h5v6h-5Zm4 11h5v6h-5Zm4 12h5v6h-5Z',
  ],
  'high-bun': ['M51 30V19h5v-5h15v4h6v12h-5v5H56v-5Z', 'M56 22v-3h13v3h-9v5h-4Z'],
  'top-knot': ['M58 30V17h4v-5h13v5h5v13h-5v4H62v-4Z', 'M62 23v-5h9v-2h4v5h-9v3Z'],
  locs: [
    'M40 45h8v27h-5v9h-6v-9h-4V56h4Zm38 0h8v9h5v17h-4v10h-7v-9h-3Z',
    'M38 56h3v13h-3Zm5-7h2v15h-2Zm37 5h3v13h-3Zm6 5h2v14h-2Z',
  ],
  braids: [
    'M40 48h7v12h-4v12h-4v15h-8V72h3V59h3Zm41 0h7v11h4v13h3v15h-8V72h-4V60h-2Z',
    'M37 61h5v3h-5Zm-3 10h5v3h-5Zm-1 9h4v3h-4Zm54-19h4v3h-4Zm2 10h4v3h-4Zm2 9h3v3h-3Z',
  ],
} satisfies Record<TiedStyle, readonly [string, string]>;

export function SpriteTiedHair({ style, paint: p }: { style: TiedStyle; paint: AvatarPaint }) {
  const [shape, highlights] = TIED_HAIR[style];
  return (
    <g shapeRendering="crispEdges">
      <path d={shape} fill={p.hairShade} stroke={p.outline} strokeWidth="2" strokeLinejoin="round" />
      <path d={highlights} fill={p.hairLight} />
    </g>
  );
}

export function TopDetails({ style, paint: p }: { style: ResolvedStyles['top']; paint: AvatarPaint }) {
  const seams = 'M-16 9h3v7h-3Zm29 0h3v7h-3Z';
  switch (style) {
    case 'tee':
      return <path d="M-27 19h13v2h-13Zm42 0h13v2H15Z" fill={p.topShade} />;
    case 'mesh-tee':
      return <path d="M-8 19h2v2h-2Zm4 3h2v2h-2Zm4-3h2v2H0Zm4 3h2v2H4Zm4-3h2v2H8Z" fill={p.topTrim} />;
    case 'raglan-top':
      return <path d="M-24 8h9l5 9h-3l-5-6h-6Zm48 0h-9l-5 9h3l5-6h6Z" fill={p.topShade} />;
    case 'sleeveless-hoodie':
      return (
        <>
          <path d="M-13 0h4l3 8h12l3-8h4l-4 12H-9Z M-9 33h18v9H-9Z" fill={p.topShade} />
          <path d="M-5 8h1v10h-1Zm9 0h1v10H4Z" fill={p.topTrim} />
        </>
      );
    case 'zip-hoodie':
    case 'fitted-zip':
      return <path d="M-1 7h2v39h-2Zm1 2h4v4H0Z" fill={p.topTrim} />;
    case 'quarter-zip':
      return <path d="M-1 5h2v12h-2Zm1 9h4v4H0Z" fill={p.topTrim} />;
    case 'track-jacket':
      return <path d="M-24 8h4v22h-4Zm44 0h4v22h-4Z" fill={p.topTrim} />;
    case 'sweatshirt':
      return <path d="M-16 40h32v5h-32ZM-6 12H6l-6 4Z" fill={p.topShade} />;
    case 'compression-top':
      return <path d="M-13 14h3v23h-3Zm23 0h3v23h-3Z" fill={p.topShade} />;
    case 'longline-training-top':
      return <path d="M-15 36h30v8h-30Z" fill={p.topShade} />;
    case 'longline-tank':
      return (
        <>
          <path d="M-15 29h30v8l2 3v7h-34v-7l2-3Z" fill={p.tank} />
          <path d="M-15 33h3v8l-2 3h26v-2h4v5h-33v-6l2-4Z" fill={p.topShade} />
        </>
      );
    case 'varsity':
      return <path d="M-11 14h6v8h-6Z M-17 40h34v3h-34Z" fill={p.topTrim} />;
    case 'hoodie':
    case 'hood-up':
      return <path d="M-5 6h1v11h-1Zm9 0h1v11H4Z" fill={p.topTrim} />;
    case 'racerback-bra':
      return <path d="M-14 25h28v3h-28Z" fill={p.topShade} />;
    case 'tank':
      return <path d={seams} fill={p.topLight} />;
  }
}

export function PantsDetails({ style, paint: p }: { style: ResolvedStyles['pants']; paint: AvatarPaint }) {
  switch (style) {
    case 'track-pants':
      return <path d="M-19 8h2v32h-2Zm36 0h2v32h-2Z" fill={p.pantsTrim} />;
    case 'tapered-joggers':
      return <path d="M-21 44h20v5h-20Zm22 0h20v5H1Z" fill={p.pantsShade} />;
    case 'liner-shorts':
      return <path d="M-20 16h17v6h-17Zm22 0h18v6H2Z" fill={p.pantsShade} />;
    case 'split-shorts':
      return <path d="M-20 9h2v9h-2Zm38 0h2v9h-2Z" fill={p.pantsTrim} />;
    case 'loose-training-shorts':
      return <path d="M-18 14h14v3h-14Zm22 0h14v3H4Z" fill={p.pantsLight} />;
    case 'bike-shorts':
      return <path d="M-13 7h2v12h-2Zm24 0h2v12h-2Z" fill={p.pantsLight} />;
    case 'training-tights':
      return <path d="M-20 6h3v41h-3Zm37 0h3v41h-3Z" fill={p.pantsShade} />;
    case 'panel-tights':
      return <path d="M-20 16h8v15h-8Zm32 0h8v15h-8Z" fill={p.pantsLight} />;
    case 'high-rise-leggings':
      return <path d="M-18 0h36v6h-36Z" fill={p.pantsShade} />;
    case 'warmup-pants':
      return <path d="M-18 36h5v4h-5Zm31 0h5v4h-5Z" fill={p.pantsTrim} />;
    case 'cargo':
      return <path d="M-20 11h9v11h-9Zm31 0h9v11h-9Z" fill={p.pantsLight} />;
    case 'jeans':
      return <path d="M-18 5h7v2h-7Zm29 0h7v2h-7Zm-13 1h2v6h-2Z" fill={p.pantsTrim} />;
    default:
      return null;
  }
}

export function ShoeDetails({ style, paint: p }: { style: ResolvedStyles['shoes']; paint: AvatarPaint }) {
  switch (style) {
    case 'runners':
      return <path d="M-6 15h5l5-6h3l-6 8h-7Z" fill={p.shoeTrim} />;
    case 'lifters':
      return <path d="M-8 8H8v3H-8Z" fill={p.shoeShade} />;
    case 'flat-lifters':
      return <path d="M-6 10H6v2H-6Z" fill={p.shoeTrim} />;
    case 'cross-trainers':
      return <path d="M-5 7h10v2H-5Zm0 4h10v2H-5Z" fill={p.shoeTrim} />;
    case 'canvas':
      return <path d="M-4 6h8v2h-8Zm0 4h8v2h-8Zm0 4h8v2h-8Z" fill={p.shoeTrim} />;
    case 'cushioned-runners':
      return <path d="M-7 20H8v2H-7Z" fill={p.shoeLight} />;
    default:
      return null;
  }
}
