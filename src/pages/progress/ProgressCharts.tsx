import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProgressPoint } from '../../api/types';
import Icon, { type IconName } from '../../components/Icon';
import { focusSibling, rovingTarget } from '../../components/roving';
import { formatNumber, numberLocale } from '../../i18n/format';
import LineChart, { type Series } from './LineChart';

/** A tiny line of every scan, oldest first; decoration only (the card's values and the chart carry the meaning). */
const Sparkline: React.FC<{ values: number[]; rtl: boolean }> = ({ values, rtl }) => {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const n = values.length;
  const pts = values
    .map((v, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = 2 + (rtl ? 1 - t : t) * 96;
      const y = 22 - ((v - lo) / (hi - lo || 1)) * 18;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      className="lu-spark my-0.5 block h-6 w-full"
      viewBox="0 0 100 26"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const month = (iso: string) => new Intl.DateTimeFormat(numberLocale(), { month: 'short' }).format(new Date(iso));
const day = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

type TrendKey = 'weight' | 'muscle' | 'bodyFat';

/** The same metric icons as the rest of the app: scale, muscle, and body fat. */
const ICON: Record<TrendKey, { name: IconName; colors: string }> = {
  weight: { name: 'scale', colors: '[--icon-color:var(--ion-color-primary)]' },
  muscle: { name: 'muscle', colors: '[--icon-color:var(--lu-muscle)]' },
  bodyFat: {
    name: 'bodyFat',
    colors: '[--icon-color:var(--lu-fat)]',
  },
};

/** Which way is good news on each trend. Weight has no right direction. */
const BETTER: Record<TrendKey, 'up' | 'down' | null> = { weight: null, muscle: 'up', bodyFat: 'down' };

interface Props {
  points: ProgressPoint[];
}

/**
 * The member picks one trend at a time: weight, muscle, or body fat.
 */
const TrendChart: React.FC<Props> = ({ points }) => {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const [pick, setPick] = useState<TrendKey>('weight');
  const uid = useId();
  const labels = points.map((p) => month(p.takenAt));
  const dates = points.map((p) => day(p.takenAt));
  const kg = t('units.kg');

  const all: Record<TrendKey, Series> = {
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
  };
  const keys: TrendKey[] = ['weight', 'muscle', 'bodyFat'];
  const s = all[pick];

  const withUnit = (v: number) => `${formatNumber(v, s.digits)}${s.unit === '%' ? '%' : s.unit ? ` ${s.unit}` : ''}`;
  const first = s.values[0];
  const last = s.values[s.values.length - 1];
  const diff = Math.round((last - first) * 10 ** s.digits) / 10 ** s.digits;
  const better = BETTER[pick];
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
    <section className="lu-card grid gap-3" aria-labelledby="chart-trend-title" data-testid="trend">
      <h2 id="chart-trend-title" className="lu-card-title">
        {t('progress.trend')}
      </h2>

      {/* Each metric is a small card with its latest value and a sparkline; picking one opens its full chart below. */}
      <div role="radiogroup" aria-label={t('progress.trendPick')} className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {keys.map((k, i) => {
          const series = all[k];
          const v = series.values;
          const d = Math.round((v[v.length - 1] - v[0]) * 10 ** series.digits) / 10 ** series.digits;
          const b = BETTER[k];
          const dTone = d === 0 || b === null ? 'text-muted' : (b === 'up') === d > 0 ? 'text-success' : 'text-danger';
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={pick === k}
              tabIndex={pick === k ? 0 : -1}
              data-testid={`trend-${k}`}
              aria-labelledby={`${uid}-${k}-name`}
              aria-describedby={`${uid}-${k}-value`}
              className={`lu-trend-card grid cursor-pointer content-start gap-1 rounded-2xl border border-line bg-surface p-2.5 text-start font-inherit text-ink transition-[border-color,box-shadow] duration-[180ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${series.colorClass}`}
              onClick={() => setPick(k)}
              onKeyDown={(e) => {
                const to = rovingTarget(e, i, keys.length, rtl);
                if (to === null) return;
                setPick(keys[to]);
                focusSibling(e, to);
              }}
            >
              <span className="flex items-center gap-1.5 text-[0.78rem] leading-tight font-semibold text-muted">
                <Icon name={ICON[k].name} className={`flex-none text-[1rem] ${ICON[k].colors}`} />
                <span id={`${uid}-${k}-name`}>{series.label}</span>
              </span>
              <span id={`${uid}-${k}-value`} className="lu-display text-[1.2rem] leading-none whitespace-nowrap">
                {formatNumber(v[v.length - 1], series.digits)}
                <span className="text-[0.7em] font-semibold text-muted">
                  {series.unit === '%' ? '%' : series.unit ? ` ${series.unit}` : ''}
                </span>
              </span>
              <Sparkline values={v} rtl={rtl} />
              <span className={`text-[0.72rem] font-semibold ${dTone}`} aria-hidden="true">
                {d > 0 ? '+' : d < 0 ? '−' : '±'}
                {formatNumber(Math.abs(d), series.digits)}
              </span>
            </button>
          );
        })}
      </div>

      {/* The headline: where you are now and how far you've come since the first scan. */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" data-testid="trend-headline">
        <strong className="lu-display text-[2rem] leading-none text-ink">{withUnit(last)}</strong>
        <span className={`inline-flex items-center gap-1 text-[0.85rem] font-semibold ${tone}`}>
          {diff !== 0 && <Icon className="flex-none" name={diff > 0 ? 'trendUp' : 'trendDown'} />}
          {since}
        </span>
      </div>
      <p className="m-0 text-[0.75rem] font-normal text-muted" aria-hidden="true">
        {s.unit}
      </p>
      <LineChart
        key={pick}
        testId="chart-trend"
        label={t('progress.trendOf', { metric: s.label })}
        labels={labels}
        dates={dates}
        series={[s]}
        rtl={rtl}
        legend={false}
        summary={[summary]}
      />
    </section>
  );
};

export default TrendChart;
