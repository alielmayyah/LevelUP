import type { AvatarPaint, ResolvedStyles } from './catalog';

type FrameStyle = Exclude<ResolvedStyles['glasses'], 'no-glasses'>;

interface Frame {
  rim: string;
  lens: string;
  bridge: string;
  detail: string;
}

// The lenses share the eyes' centerline and fit inside the hijab's face opening.
const FRAMES: Record<FrameStyle, Frame> = {
  'round-glasses': {
    rim: 'M1260 267h30v6h10v9h7v10h5v30h-5v10h-7v9h-10v6h-30v-6h-10v-9h-7v-10h-5v-30h5v-10h7v-9h10z',
    lens: 'M1264 276h22v5h9v9h7v11h2v13h-2v10h-7v9h-9v5h-22v-5h-9v-9h-7v-10h-2v-13h2v-11h7v-9h9z',
    bridge: 'M1308 297h11v-6h18v6h11v9h-13v-6h-14v6h-13z',
    detail: 'M1260 270h29v3h-29z M1242 299h3v13h-3z',
  },
  'rectangular-glasses': {
    rim: 'M1241 272h69v7h6v59h-6v6h-69v-6h-5v-59h5z',
    lens: 'M1246 282h59v52h-59z',
    bridge: 'M1313 294h30v9h-30z',
    detail: 'M1244 275h61v3h-61z M1238 287h6v5h-6z',
  },
  'sport-glasses': {
    rim: 'M1235 277h17v-8h56v7h12v14h-6v44h-9v10h-52v-8h-9v-11h-6v-33h-3z',
    lens: 'M1249 290h8v-9h45v7h7v12h-6v28h-6v6h-39v-7h-7v-8h-2z',
    bridge: 'M1314 280h28v10h-28z M1314 293h28v8h-9v-4h-10v4h-9z',
    detail: 'M1238 280h18v-7h49v4h-47v9h-20z M1252 329h9v8h32v4h-38v-7h-3z',
  },
};

export function Glasses({ style, paint }: { style: FrameStyle; paint: AvatarPaint }) {
  const frame = FRAMES[style];
  const lens = (
    <>
      <path fill={paint.outline} fillRule="evenodd" d={`${frame.rim} ${frame.lens}`} />
      <path fill={paint.trim} fillOpacity={style === 'sport-glasses' ? 0.9 : 0.56} d={frame.detail} />
    </>
  );
  return (
    <g data-style-layer="glasses" data-variant={style}>
      <path fill={paint.outline} d={frame.bridge} />
      {lens}
      <g transform="translate(2656 0) scale(-1 1)">{lens}</g>
    </g>
  );
}
