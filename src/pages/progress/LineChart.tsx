import { useId, useMemo, useRef, useState } from 'react';

import { formatNumber } from '../../i18n/format';
import './LineChart.scss';

export interface Series {
  key: string;
  label: string;
  /** CSS class that sets --series to the line's color token. */
  colorClass: string;
  values: number[];
  axis: 'start' | 'end';
  unit: string;
  digits: number;
}

interface Props {
  /** X labels, oldest first (e.g. "Jun"). */
  labels: string[];
  /** Full dates for the tooltip, oldest first. */
  dates: string[];
  series: Series[];
  /** Fixed scale for the start-side axis, e.g. FitScore 0–100. */
  startRange?: [number, number];
  /** Time runs right to left and the axes swap sides. */
  rtl: boolean;
  /** One sentence per line for screen readers. */
  summary: string[];
  legend?: boolean;
  testId: string;
  /** Accessible name of the chart (its visible title). */
  label: string;
}

const W = 320;
const H = 168;
const PAD = { top: 12, bottom: 24, side: 34 };

/** A round-number range around the data with a little headroom. */
function niceRange(values: number[]): [number, number] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || Math.abs(hi) || 1;
  const step = 10 ** Math.floor(Math.log10(span));
  return [Math.floor((lo - span * 0.15) / step) * step, Math.ceil((hi + span * 0.15) / step) * step];
}

/** At most this many date labels along the bottom; with more scans, every other one is skipped. */
const MAX_X_LABELS = 6;

/**
 * A small, smooth line chart: round points, one quiet baseline, a tappable
 * column per scan that shows every visible value for that date, and a legend
 * that hides or shows each line.
 */
const LineChart: React.FC<Props> = ({
  labels,
  dates,
  series,
  startRange,
  rtl,
  summary,
  legend = true,
  testId,
  label,
}) => {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const id = useId();

  const visible = series.filter((s) => !hidden.has(s.key));
  const n = labels.length;

  const ranges = useMemo(() => {
    const of = (axis: Series['axis']) => {
      const vals = series.filter((s) => s.axis === axis).flatMap((s) => s.values);
      return vals.length ? niceRange(vals) : null;
    };
    return { start: startRange ?? of('start'), end: of('end') };
  }, [series, startRange]);

  const plotW = W - PAD.side * 2;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return PAD.side + (rtl ? 1 - t : t) * plotW;
  };
  const y = (v: number, axis: Series['axis']) => {
    const [lo, hi] = ranges[axis] ?? [0, 1];
    return PAD.top + (1 - (v - lo) / (hi - lo || 1)) * plotH;
  };
  // The start axis sits on the reading-start side: left in English, right in Arabic.
  const startX = rtl ? W - PAD.side + 6 : PAD.side - 6;
  const endX = rtl ? PAD.side - 6 : W - PAD.side + 6;

  const ticks = (axis: Series['axis']) => {
    const r = ranges[axis];
    if (!r) return [];
    // Just the bottom and top of the scale: the line and its points carry the detail.
    return [r[0], r[1]];
  };
  const labelEvery = Math.ceil(n / MAX_X_LABELS);
  const showLabel = (i: number) => i === n - 1 || (i % labelEvery === 0 && n - 1 - i >= labelEvery);

  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const columnW = n > 1 ? plotW / (n - 1) : plotW;

  const hits = useRef<(SVGRectElement | null)[]>([]);
  const withUnit = (s: Series, v: number) =>
    `${formatNumber(v, s.digits)}${!s.unit ? '' : s.unit === '%' ? '%' : ` ${s.unit}`}`;
  const pointLabel = (i: number) =>
    `${dates[i]}: ${visible.map((s) => `${s.label} ${withUnit(s, s.values[i])}`).join(', ')}`;

  /** Arrow keys walk the scans in reading order (right-to-left in Arabic); Home/End jump to the ends. */
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const next =
      e.key === forward ? i + 1 : e.key === back ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target = Math.min(n - 1, Math.max(0, next));
    setActive(target);
    hits.current[target]?.focus();
  };

  return (
    // Chart points take taps, so a swipe that starts on the chart stays on this tab.
    <div className="lu-chart" data-testid={testId} data-no-tab-swipe>
      <div className="relative">
        {/* A group, not an image, so the per-scan points inside stay reachable by screen readers. */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label={label}
          aria-roledescription="chart"
          aria-describedby={`${id}-summary`}
        >
          {ticks('start').map((v, i) => (
            <g key={`s${v}`}>
              {/* One faint baseline; the top of the scale is only labelled. */}
              {i === 0 && (
                <line className="lu-chart-grid" x1={PAD.side} x2={W - PAD.side} y1={y(v, 'start')} y2={y(v, 'start')} />
              )}
              <text className="lu-chart-axis" x={startX} y={y(v, 'start') + 3} textAnchor={rtl ? 'start' : 'end'}>
                {formatNumber(v, 0)}
              </text>
            </g>
          ))}
          {ticks('end').map((v) => (
            <text
              key={`e${v}`}
              className="lu-chart-axis"
              x={endX}
              y={y(v, 'end') + 3}
              textAnchor={rtl ? 'end' : 'start'}
            >
              {formatNumber(v, 0)}
            </text>
          ))}
          {labels.map(
            (l, i) =>
              showLabel(i) && (
                <text key={`${l}-${i}`} className="lu-chart-axis" x={x(i)} y={H - 6} textAnchor="middle">
                  {l}
                </text>
              ),
          )}

          {active !== null && (
            <line className="lu-chart-cursor" x1={x(active)} x2={x(active)} y1={PAD.top} y2={H - PAD.bottom} />
          )}

          {visible.map((s) => (
            <g key={s.key} className={`lu-chart-series ${s.colorClass}`}>
              <polyline points={s.values.map((v, i) => `${x(i)},${y(v, s.axis)}`).join(' ')} />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v, s.axis)} r={active === i ? 4.5 : 3.5} />
              ))}
            </g>
          ))}

          {/*
           * One target per scan: tap it, or Tab to the chart and use the arrow
           * keys (WCAG 2.1.1). Focus shows the same values as a tap.
           */}
          {labels.map((_, i) => (
            <rect
              key={`hit-${i}`}
              ref={(el) => {
                hits.current[i] = el;
              }}
              className="lu-chart-hit"
              data-testid={`${testId}-point-${i}`}
              role="button"
              tabIndex={i === (active ?? n - 1) ? 0 : -1}
              aria-label={pointLabel(i)}
              aria-pressed={active === i}
              x={x(i) - columnW / 2}
              y={PAD.top}
              width={columnW}
              height={plotH}
              // A tap also focuses the point, so it simply shows its values (no toggle that would undo the focus).
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
            />
          ))}
        </svg>

        {active !== null && (
          <div
            className="lu-chart-tip pointer-events-none absolute top-0 z-1 grid gap-0.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-[0.78rem] whitespace-nowrap shadow-card-sm"
            data-testid={`${testId}-tip`}
            role="status"
            style={{
              insetInlineStart: `${Math.min(Math.max(((rtl ? W - x(active) : x(active)) / W) * 100, 18), 82)}%`,
            }}
          >
            <strong>{dates[active]}</strong>
            {visible.map((s) => (
              <span key={s.key} className={`inline-flex items-center gap-1.5 ${s.colorClass}`}>
                <i className="size-2 bg-(--series)" aria-hidden="true" />
                {s.label} {withUnit(s, s.values[active])}
              </span>
            ))}
          </div>
        )}
      </div>

      {legend && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {series.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`lu-chart-key inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 font-inherit text-[0.78rem] font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[pressed=false]:text-muted aria-[pressed=false]:line-through aria-[pressed=false]:opacity-60 ${s.colorClass}`}
              aria-pressed={!hidden.has(s.key)}
              onClick={() => toggle(s.key)}
            >
              <i className="size-2 bg-(--series)" aria-hidden="true" />
              {s.label}
            </button>
          ))}
        </div>
      )}

      <p id={`${id}-summary`} className="sr-only">
        {summary.join(' ')}
      </p>
    </div>
  );
};

export default LineChart;
