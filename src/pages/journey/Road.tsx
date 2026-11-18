import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { JourneyStop } from '../../api/types';
import { formatMonth } from './dates';

const W = 320;
const H = 88;
const PAD = 14;

/** Where along the road a time sits: 0 at the first scan, 1 at the next one due. */
const along = (t: number, t0: number, t1: number) => (t1 > t0 ? (t - t0) / (t1 - t0) : 0);

/** The road climbs gently from the first scan, with a soft wave so it reads as a path, not a chart. */
const yAt = (p: number) => H - 22 - p * 40 + Math.sin(p * Math.PI * 2.2) * 6;

/**
 * The signature visual: a true date axis with a stamped stop per scan, the
 * latest highlighted and the next scan dashed at the end. Time runs from the
 * reading start, so in Arabic the first scan is on the right.
 */
export function Road({ stops, nextDue }: { stops: JourneyStop[]; nextDue: string | null }) {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const gradientId = `road-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  if (stops.length === 0) return null;

  const times = stops.map((s) => new Date(s.takenAt).getTime());
  const t0 = times[0];
  const last = times[times.length - 1];
  const t1 = nextDue ? new Date(nextDue).getTime() : last;
  const x = (p: number) => {
    const fromStart = PAD + p * (W - 2 * PAD);
    return rtl ? W - fromStart : fromStart;
  };
  const point = (p: number) => `${x(p).toFixed(1)},${yAt(p).toFixed(1)}`;
  const path = (from: number, to: number) => {
    const n = Math.max(2, Math.round((to - from) * 40));
    return Array.from({ length: n + 1 }, (_, i) => point(from + ((to - from) * i) / n)).join(' ');
  };
  const pLast = along(last, t0, t1);
  const hasNext = nextDue !== null && pLast < 1;

  return (
    <figure className="m-0 grid gap-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={t('journey.road.aria', {
          count: stops.length,
          from: formatMonth(stops[0].takenAt),
          to: formatMonth(stops[stops.length - 1].takenAt),
          next: nextDue ? formatMonth(nextDue) : '—',
        })}
        data-testid="road"
      >
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={x(0)} x2={x(1)} y1="0" y2="0">
            <stop offset="0" style={{ stopColor: 'var(--lu-brand-soft)' }} />
            <stop offset="1" style={{ stopColor: 'var(--lu-brand)' }} />
          </linearGradient>
        </defs>
        {hasNext && (
          <polyline
            points={path(pLast, 1)}
            fill="none"
            stroke="var(--lu-line)"
            strokeWidth="3"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
        )}
        {stops.length > 1 && (
          <polyline
            points={path(0, pLast)}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {stops.map((s, i) => {
          const p = along(times[i], t0, t1);
          const latest = i === stops.length - 1;
          return (
            <g key={s.id} data-testid="road-stop" data-latest={latest ? 'true' : undefined} data-same={s.sameMachine}>
              {latest && <circle cx={x(p)} cy={yAt(p)} r="11" fill="var(--lu-brand-tint)" />}
              <circle
                cx={x(p)}
                cy={yAt(p)}
                r={latest ? 7 : 5.5}
                fill={latest ? 'var(--lu-brand-soft)' : 'var(--lu-surface-1)'}
                stroke={s.sameMachine ? 'var(--lu-brand-soft)' : 'var(--lu-line)'}
                strokeWidth="2.5"
                strokeDasharray={s.sameMachine ? undefined : '3 3'}
              />
            </g>
          );
        })}
        {hasNext && (
          <circle
            cx={x(1)}
            cy={yAt(1)}
            r="6"
            fill="var(--lu-surface-1)"
            stroke="var(--lu-line)"
            strokeWidth="2"
            strokeDasharray="3 3"
            data-testid="road-next"
          />
        )}
      </svg>
      <figcaption className="flex justify-between gap-3 text-caption text-muted" aria-hidden="true">
        <span>{formatMonth(stops[0].takenAt)}</span>
        {hasNext && nextDue && (
          <span>
            {t('journey.road.next')} · {formatMonth(nextDue)}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export default Road;
