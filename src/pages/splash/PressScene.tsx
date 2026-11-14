/*
 * The splash backdrop: a pixel-art lifter on a gym platform doing military
 * presses on a loop. Drawn on a 32×40 grid as plain rects, so it costs a few
 * KB of markup and no image download.
 *
 * Every part is drawn twice: first as a 1-pixel-bigger outline, then as its
 * fill, so overlapping parts merge into one outlined silhouette. The three
 * poses (rack, mid, lockout) are separate layers; Splash.scss steps between
 * them and pops the sparkles at lockout.
 */

type Paint = 'skin' | 'shade' | 'hair' | 'tank' | 'shorts' | 'shoe' | 'metal' | 'metalHi' | 'plate' | 'plateHi' | 'ink';

interface Part {
  x: number;
  y: number;
  w: number;
  h: number;
  c: Paint;
  /** Drawn without an outline (eyes, highlights). */
  flat?: boolean;
}

const r = (x: number, y: number, w: number, h: number, c: Paint, flat = false): Part => ({ x, y, w, h, c, flat });

/** Head, torso, legs: the same in every pose. */
const BODY: Part[] = [
  r(15, 16, 2, 1, 'skin'), // neck
  r(12, 17, 8, 8, 'tank'),
  r(12, 25, 8, 4, 'shorts'),
  r(12, 29, 3, 6, 'skin'),
  r(17, 29, 3, 6, 'skin'),
  r(11, 35, 4, 2, 'shoe'),
  r(17, 35, 4, 2, 'shoe'),
  r(12, 9, 8, 7, 'skin'), // head
  r(12, 8, 8, 3, 'hair'),
  r(11, 9, 1, 2, 'hair'),
  r(20, 9, 1, 2, 'hair'),
  r(13, 7, 2, 1, 'hair'),
  r(17, 7, 2, 1, 'hair'),
];

/** A barbell centered on row `y`: bar, collars, and two plates per side. */
const barbell = (y: number): Part[] => [
  r(2, y, 28, 1, 'metal'),
  r(3, y - 3, 2, 7, 'plate'),
  r(27, y - 3, 2, 7, 'plate'),
  r(3, y - 3, 1, 7, 'plateHi', true),
  r(27, y - 3, 1, 7, 'plateHi', true),
  r(5, y - 2, 1, 5, 'plate'),
  r(26, y - 2, 1, 5, 'plate'),
  r(9, y, 14, 1, 'metalHi', true),
];

const face = (strain: boolean): Part[] =>
  strain
    ? [r(14, 12, 2, 1, 'ink', true), r(17, 12, 2, 1, 'ink', true), r(15, 14, 2, 1, 'ink', true)]
    : [r(14, 12, 1, 2, 'ink', true), r(17, 12, 1, 2, 'ink', true), r(15, 14, 2, 1, 'shade', true)];

/** Bar resting on the collarbones, elbows down and in front. */
const RACK: Part[] = [
  ...barbell(16),
  r(9, 16, 2, 5, 'skin'),
  r(21, 16, 2, 5, 'skin'),
  r(11, 17, 1, 2, 'skin'),
  r(20, 17, 1, 2, 'skin'),
  r(9, 15, 2, 2, 'skin'),
  r(21, 15, 2, 2, 'skin'),
  ...face(false),
];

/** Halfway: the bar has just cleared the head. */
const MID: Part[] = [
  ...barbell(5),
  r(9, 6, 2, 13, 'skin'),
  r(21, 6, 2, 13, 'skin'),
  r(11, 17, 1, 2, 'skin'),
  r(20, 17, 1, 2, 'skin'),
  r(9, 4, 2, 2, 'skin'),
  r(21, 4, 2, 2, 'skin'),
  ...face(true),
];

/** Lockout: arms straight overhead. */
const LOCK: Part[] = [
  ...barbell(3),
  r(10, 4, 2, 15, 'skin'),
  r(20, 4, 2, 15, 'skin'),
  r(10, 2, 2, 2, 'skin'),
  r(20, 2, 2, 2, 'skin'),
  ...face(true),
];

/** Pixel sparkles around the plates at lockout. */
const Sparkle: React.FC<{ x: number; y: number; big?: boolean }> = ({ x, y, big }) => (
  <g className="lu-press-spark" style={{ transformOrigin: `${x + 0.5}px ${y + 0.5}px` }}>
    <rect x={x} y={y} width={1} height={1} />
    {big && (
      <>
        <rect x={x - 1} y={y} width={1} height={1} />
        <rect x={x + 1} y={y} width={1} height={1} />
        <rect x={x} y={y - 1} width={1} height={1} />
        <rect x={x} y={y + 1} width={1} height={1} />
      </>
    )}
  </g>
);

const Layer: React.FC<{ parts: Part[]; className?: string }> = ({ parts, className }) => (
  <g className={className}>
    {parts
      .filter((p) => !p.flat)
      .map((p, i) => (
        <rect key={`o${i}`} className="lu-px-ink" x={p.x - 1} y={p.y - 1} width={p.w + 2} height={p.h + 2} />
      ))}
    {parts.map((p, i) => (
      <rect key={`f${i}`} className={`lu-px-${p.c}`} x={p.x} y={p.y} width={p.w} height={p.h} />
    ))}
  </g>
);

const PressScene: React.FC = () => (
  <svg
    className="lu-press block h-full w-auto"
    viewBox="-4 -2 40 44"
    shapeRendering="crispEdges"
    aria-hidden="true"
    focusable="false"
    data-testid="splash-scene"
  >
    {/* Platform: a rubber floor strip with seams, and the lifter's shadow on it. */}
    <rect className="lu-px-floorEdge" x={-4} y={37} width={40} height={1} />
    <rect className="lu-px-floor" x={-4} y={38} width={40} height={4} />
    {[2, 10, 22, 30].map((x) => (
      <rect key={x} className="lu-px-floorSeam" x={x} y={38} width={1} height={4} />
    ))}
    <rect className="lu-press-shadow lu-px-floorSeam" x={9} y={37} width={14} height={1} />

    <Layer parts={BODY} />
    <Layer parts={RACK} className="lu-press-frame lu-press-rack" />
    <Layer parts={MID} className="lu-press-frame lu-press-mid" />
    <Layer parts={LOCK} className="lu-press-frame lu-press-lock" />

    <g className="lu-press-sparks">
      <Sparkle x={1} y={0} big />
      <Sparkle x={31} y={1} big />
      <Sparkle x={6} y={-1} />
      <Sparkle x={25} y={-1} />
      <Sparkle x={16} y={-1} big />
    </g>
  </svg>
);

export default PressScene;
