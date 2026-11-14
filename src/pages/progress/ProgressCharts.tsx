import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProgressPoint } from '../../api/types';
import PixelIcon, { type PixelIconName } from '../../components/PixelIcon';
import { focusSibling, rovingTarget } from '../../components/roving';
import { formatNumber, numberLocale } from '../../i18n/format';
import LineChart, { type Series } from './LineChart';

const month = (iso: string) => new Intl.DateTimeFormat(numberLocale(), { month: 'short' }).format(new Date(iso));
const day = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

type TrendKey = 'weight' | 'muscle' | 'bodyFat' | 'score';

/** The same metric icons as the rest of the app: scale, muscle, flame, and the FitScore trophy. */
const ICON: Record<TrendKey, { name: PixelIconName; colors: string }> = {
  weight: { name: 'scale', colors: '[--px-hi:var(--lu-surface)]' },
  muscle: { name: 'muscle', colors: '[--px-fill:var(--lu-muscle)] [--px-hi:var(--lu-muscle-hi)]' },
  bodyFat: {
    name: 'flame',
    colors: '[--px-core:var(--lu-fat-core)] [--px-fill:var(--lu-fat)] [--px-hi:var(--lu-fat-hi)]',
  },
  score: { name: 'trophy', colors: '[--px-fill:var(--lu-gold)] [--px-hi:var(--lu-fat-core)]' },
};

/** Which way is good news on each trend. Weight has no right direction. */
const BETTER: Record<TrendKey, 'up' | 'down' | null> = { weight: null, muscle: 'up', bodyFat: 'down', score: 'up' };

interface Props {
  points: ProgressPoint[];
  showFitScore: boolean;
}

/**
 * One simple line at a time: the member picks Weight, Muscle, Body fat, or
 * FitScore. Loaded in its own chunk after the page.
 */
const TrendChart: React.FC<Props> = ({ points, showFitScore }) => {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const [pick, setPick] = useState<TrendKey>('weight');
  const labels = points.map((p) => month(p.takenAt));
  const dates = points.map((p) => day(p.takenAt));
  const kg = t('units.kg');

  const all: Record<TrendKey, Series & { range?: [number, number] }> = {
    weight: {
      key: 'weight',
      label: t('progress.metric.weight'),
      colorClass: 'lu-series-weight',
      values: points.map((p) => p.weightKg),
      axis: 'start',
      unit: kg,
      digits: 1,
    },
    muscle: {
      key: 'muscle',
      label: t('progress.metric.muscle'),
      colorClass: 'lu-series-muscle',
      values: points.map((p) => p.skeletalMuscleKg),
      axis: 'start',
      unit: kg,
      digits: 1,
    },
    bodyFat: {
      key: 'bodyFat',
      label: t('progress.metric.bodyFat'),
      colorClass: 'lu-series-fat',
      values: points.map((p) => p.bodyFatPct),
      axis: 'start',
      unit: '%',
      digits: 1,
    },
    score: {
      key: 'score',
      label: t('home.fitScore.title'),
      colorClass: 'lu-series-score',
      values: points.map((p) => p.fitScore),
      axis: 'start',
      unit: '',
      digits: 0,
      range: [0, 100],
    },
  };
  const keys: TrendKey[] = showFitScore ? ['weight', 'muscle', 'bodyFat', 'score'] : ['weight', 'muscle', 'bodyFat'];
  const current = keys.includes(pick) ? pick : 'weight';
  const s = all[current];

  const withUnit = (v: number) => `${formatNumber(v, s.digits)}${s.unit === '%' ? '%' : s.unit ? ` ${s.unit}` : ''}`;
  const first = s.values[0];
  const last = s.values[s.values.length - 1];
  const diff = Math.round((last - first) * 10 ** s.digits) / 10 ** s.digits;
  const better = BETTER[current];
  const tone =
    diff === 0 || better === null ? 'text-muted' : (better === 'up') === diff > 0 ? 'text-success' : 'text-danger';
  const since = t(diff > 0 ? 'progress.upSince' : diff < 0 ? 'progress.downSince' : 'progress.sameSince', {
    amount: withUnit(Math.abs(diff)),
    date: labels[0],
  });

  const summary = t('progress.summary', {
    metric: s.label,
    from: withUnit(s.values[0]),
    to: withUnit(s.values[s.values.length - 1]),
    first: dates[0],
    last: dates[dates.length - 1],
  });

  return (
    <section className="lu-px-card grid gap-3" aria-labelledby="chart-trend-title" data-testid="trend">
      <h2 id="chart-trend-title" className="lu-card-title">
        {t('progress.trend')}
      </h2>

      <div
        role="radiogroup"
        aria-label={t('progress.trendPick')}
        className={`grid gap-1 rounded-[10px] bg-surface-2 p-1 ${keys.length === 4 ? 'grid-cols-2 min-[360px]:grid-cols-4' : 'grid-cols-3'}`}
      >
        {keys.map((k, i) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={current === k}
            tabIndex={current === k ? 0 : -1}
            data-testid={`trend-${k}`}
            className="flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-0 bg-transparent px-1 py-1.5 font-inherit text-[0.78rem] leading-tight font-extrabold [overflow-wrap:normal] text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-checked:bg-primary aria-checked:text-primary-contrast"
            onClick={() => setPick(k)}
            onKeyDown={(e) => {
              const to = rovingTarget(e, i, keys.length, rtl);
              if (to === null) return;
              setPick(keys[to]);
              focusSibling(e, to);
            }}
          >
            <PixelIcon name={ICON[k].name} className={`text-[1.15rem] ${ICON[k].colors}`} />
            {all[k].label}
          </button>
        ))}
      </div>

      {/* The headline: where you are now and how far you've come since the first scan. */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" data-testid="trend-headline">
        <strong className="lu-display text-[2rem] leading-none text-ink">{withUnit(last)}</strong>
        <span className={`text-[0.85rem] font-extrabold ${tone}`}>
          {diff !== 0 && <span aria-hidden="true">{diff > 0 ? '▲ ' : '▼ '}</span>}
          {since}
        </span>
      </div>
      <p className="m-0 text-[0.75rem] font-bold text-muted" aria-hidden="true">
        {s.unit || t('home.fitScore.title')}
      </p>
      <LineChart
        key={current}
        testId="chart-trend"
        label={t('progress.trendOf', { metric: s.label })}
        labels={labels}
        dates={dates}
        series={[s]}
        startRange={s.range}
        rtl={rtl}
        legend={false}
        summary={[summary]}
      />
    </section>
  );
};

export default TrendChart;
