import { useTranslation } from 'react-i18next';

import type { AssessmentDto, JourneyDto } from '../../api/types';
import { formatNumber } from '../../i18n/format';
import { formatMonth } from '../journey/dates';

const W = 320;
const H = 96;
const PAD_X = 16;
const PAD_Y = 14;

interface Lane {
  key: 'muscle' | 'fat';
  label: string;
  color: string;
  noise: number;
  of: (a: AssessmentDto) => number;
}

/**
 * Muscle and fat in two lanes on one true date axis (ui-standards →
 * TrendLanes): fixed scales, a dot per scan, the grey noise band around the
 * first scan, and a flag where a line leaves it. Time runs from the reading
 * start, so in Arabic the oldest scan is on the right.
 */
export function TrendLanes({ scans, journey }: { scans: AssessmentDto[]; journey: JourneyDto }) {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const kg = t('units.kg');
  const lanes: Lane[] = [
    {
      key: 'muscle',
      label: t('journey.change.muscleKg'),
      color: 'var(--lu-muscle)',
      noise: journey.noise.muscleKg,
      of: (a) => a.skeletalMuscleKg,
    },
    {
      key: 'fat',
      label: t('journey.change.fatKg'),
      color: 'var(--lu-fat)',
      noise: journey.noise.fatKg,
      of: (a) => a.bodyFatKg,
    },
  ];
  const sameMachine = new Map(journey.stops.map((s) => [s.id, s.sameMachine]));
  const times = scans.map((s) => new Date(s.takenAt).getTime());
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const x = (time: number) => {
    const p = t1 > t0 ? (time - t0) / (t1 - t0) : 0.5;
    const fromStart = PAD_X + p * (W - 2 * PAD_X);
    return rtl ? W - fromStart : fromStart;
  };

  return (
    <div className="grid gap-4" data-testid="trend-lanes">
      {lanes.map((lane) => {
        const values = scans.map(lane.of);
        const first = values[0];
        // A fixed scale: three noise floors either side of the first scan, widened only if the data goes further.
        const lo = Math.min(first - 3 * lane.noise, ...values);
        const hi = Math.max(first + 3 * lane.noise, ...values);
        const y = (v: number) => PAD_Y + ((hi - v) / (hi - lo)) * (H - 2 * PAD_Y);
        const flagAt = values.findIndex(
          (v, i) => i > 0 && sameMachine.get(scans[i].id) !== false && Math.abs(v - first) >= lane.noise,
        );
        const points = scans.map((s, i) => ({
          x: x(times[i]),
          y: y(values[i]),
          same: sameMachine.get(s.id) !== false,
        }));
        return (
          <figure key={lane.key} className="m-0 grid gap-1" data-testid={`lane-${lane.key}`}>
            <figcaption className="flex items-baseline justify-between gap-3">
              <span className="text-label text-ink">{lane.label}</span>
              <span className="text-caption text-muted">
                {formatNumber(first, 1)} → {formatNumber(values[values.length - 1], 1)} {kg}
              </span>
            </figcaption>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="block h-auto w-full"
              role="img"
              aria-label={t('scans.chartAria', {
                metric: lane.label,
                from: `${formatNumber(first, 1)} ${kg}`,
                to: `${formatNumber(values[values.length - 1], 1)} ${kg}`,
              })}
            >
              <rect
                x={PAD_X / 2}
                width={W - PAD_X}
                y={y(first + lane.noise)}
                height={y(first - lane.noise) - y(first + lane.noise)}
                rx="6"
                fill="var(--lu-surface-3)"
                data-testid={`lane-${lane.key}-band`}
              />
              {points.slice(1).map((p, i) => (
                <line
                  key={i}
                  x1={points[i].x}
                  y1={points[i].y}
                  x2={p.x}
                  y2={p.y}
                  stroke={lane.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  // A gap of more than ~10 weeks between scans is drawn dashed.
                  strokeDasharray={times[i + 1] - times[i] > 70 * 86_400_000 ? '4 5' : undefined}
                />
              ))}
              {points.map((p, i) => (
                <circle
                  key={scans[i].id}
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill={p.same ? lane.color : 'var(--lu-surface-1)'}
                  stroke={lane.color}
                  strokeWidth="2"
                />
              ))}
              {flagAt > 0 && (
                <g data-testid={`lane-${lane.key}-flag`}>
                  <line
                    x1={points[flagAt].x}
                    x2={points[flagAt].x}
                    y1={points[flagAt].y - 8}
                    y2={points[flagAt].y - 24}
                    stroke="var(--lu-brand-soft)"
                    strokeWidth="2"
                  />
                  <path
                    d={`M ${points[flagAt].x} ${points[flagAt].y - 24} l ${rtl ? -10 : 10} 4 l ${rtl ? 10 : -10} 4 z`}
                    fill="var(--lu-brand-soft)"
                  />
                </g>
              )}
            </svg>
          </figure>
        );
      })}
      <div className="flex justify-between gap-3 text-caption text-muted" aria-hidden="true">
        <span>{formatMonth(scans[0].takenAt)}</span>
        <span>{formatMonth(scans[scans.length - 1].takenAt)}</span>
      </div>
    </div>
  );
}

export default TrendLanes;
