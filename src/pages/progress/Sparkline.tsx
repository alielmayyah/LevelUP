import type { CSSProperties } from 'react';

/**
 * A tiny trend line for one measurement across scans, oldest to newest, with
 * a dot on the latest. Drawn (data-draw) and dotted (data-dot) by the page's
 * entrance. Decorative: the numbers beside it carry the meaning.
 */
const Sparkline: React.FC<{ values: number[]; color: string; className?: string }> = ({
  values,
  color,
  className = '',
}) => {
  if (values.length < 2) return null;
  const W = 100;
  const H = 32;
  const PAD = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / span) * (H - PAD * 2);
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg
      className={`lu-spark block overflow-visible ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      style={{ '--spark': color } as CSSProperties}
    >
      <path d={d} pathLength={1} vectorEffect="non-scaling-stroke" data-draw />
      <circle cx={lx} cy={ly} r={3.2} data-dot />
    </svg>
  );
};

export default Sparkline;
