/*
 * The splash's loading indicator: a pixel barbell that gets "loaded" with
 * plates, one pair at a time, in step with the splash timer. When the last
 * pair is on, the bar gives a small lift. Drawn on a 48×14 grid.
 * Splash.scss times each pair; reduced motion shows the bar fully loaded.
 */

/** Plates from the collar outward: biggest first, like a real bar. */
const PLATES = [
  { h: 12, tone: 'a' },
  { h: 12, tone: 'b' },
  { h: 10, tone: 'a' },
  { h: 8, tone: 'c' },
] as const;

const CENTER_Y = 7;
const LEFT_COLLAR = 15;
const RIGHT_COLLAR = 32;

const Plate: React.FC<{ x: number; h: number; tone: string; step: number; side: 'l' | 'r' }> = ({
  x,
  h,
  tone,
  step,
  side,
}) => {
  const y = CENTER_Y - h / 2;
  return (
    <g className={`lu-bb-plate lu-bb-${side} lu-bb-step-${step}`}>
      <rect className="lu-bb-ink" x={x - 1} y={y - 1} width={4} height={h + 2} />
      <rect className={`lu-bb-tone-${tone}`} x={x} y={y} width={2} height={h} />
      <rect className="lu-bb-hi" x={x} y={y} width={1} height={h} />
    </g>
  );
};

const BarbellLoader: React.FC<{ label: string; durationMs: number }> = ({ label, durationMs }) => (
  <div
    className="lu-bb relative"
    role="status"
    aria-label={label}
    style={{ '--lu-splash-ms': `${durationMs}ms` } as React.CSSProperties}
  >
    <svg
      className="block h-auto w-[clamp(132px,40vw,184px)]"
      viewBox="0 0 48 14"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <g className="lu-bb-lift">
        {/* The bar, its knurled grip, and the two collars. */}
        <rect className="lu-bb-ink" x={1} y={CENTER_Y - 2} width={46} height={3} />
        <rect className="lu-bb-metal" x={2} y={CENTER_Y - 1} width={44} height={1} />
        {[19, 21, 23, 25, 27].map((x) => (
          <rect key={x} className="lu-bb-grip" x={x} y={CENTER_Y - 1} width={1} height={1} />
        ))}
        <rect className="lu-bb-ink" x={LEFT_COLLAR} y={CENTER_Y - 3} width={2} height={5} />
        <rect className="lu-bb-ink" x={RIGHT_COLLAR - 1} y={CENTER_Y - 3} width={2} height={5} />
        {PLATES.map((p, i) => (
          <Plate key={`l${i}`} side="l" step={i + 1} x={LEFT_COLLAR - 3 - i * 3} h={p.h} tone={p.tone} />
        ))}
        {PLATES.map((p, i) => (
          <Plate key={`r${i}`} side="r" step={i + 1} x={RIGHT_COLLAR + 1 + i * 3} h={p.h} tone={p.tone} />
        ))}
      </g>
    </svg>
  </div>
);

export default BarbellLoader;
