import { IonIcon } from '@ionic/react';
import { analyticsOutline, pulseOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import type { ProgressPoint } from '../../api/types';
import { formatNumber, numberLocale } from '../../i18n/format';
import LineChart, { type Series } from './LineChart';

const month = (iso: string) => new Intl.DateTimeFormat(numberLocale(), { month: 'short' }).format(new Date(iso));
const day = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

interface Props {
  points: ProgressPoint[];
  showFitScore: boolean;
}

/** Body composition and FitScore over time. Loaded in its own chunk after the page. */
const ProgressCharts: React.FC<Props> = ({ points, showFitScore }) => {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const labels = points.map((p) => month(p.takenAt));
  const dates = points.map((p) => day(p.takenAt));
  const kg = t('units.kg');

  const summary = (s: Series) =>
    t('progress.summary', {
      metric: s.label,
      from: `${formatNumber(s.values[0], s.digits)}${s.unit === '%' ? '%' : s.unit ? ` ${s.unit}` : ''}`,
      to: `${formatNumber(s.values[s.values.length - 1], s.digits)}${s.unit === '%' ? '%' : s.unit ? ` ${s.unit}` : ''}`,
      first: dates[0],
      last: dates[dates.length - 1],
    });

  const composition: Series[] = [
    {
      key: 'weight',
      label: t('progress.metric.weight'),
      colorClass: 'lu-series-weight',
      values: points.map((p) => p.weightKg),
      axis: 'start',
      unit: kg,
      digits: 1,
    },
    {
      key: 'muscle',
      label: t('progress.metric.muscle'),
      colorClass: 'lu-series-muscle',
      values: points.map((p) => p.skeletalMuscleKg),
      axis: 'start',
      unit: kg,
      digits: 1,
    },
    {
      key: 'fat',
      label: t('progress.metric.bodyFat'),
      colorClass: 'lu-series-fat',
      values: points.map((p) => p.bodyFatPct),
      axis: 'end',
      unit: '%',
      digits: 1,
    },
  ];

  const score: Series = {
    key: 'score',
    label: t('home.fitScore.title'),
    colorClass: 'lu-series-score',
    values: points.map((p) => p.fitScore),
    axis: 'start',
    unit: '',
    digits: 0,
  };
  const latest = points[points.length - 1];

  return (
    <>
      <section className="lu-px-card lu-progress-chart" aria-labelledby="chart-composition">
        <h2 id="chart-composition" className="lu-card-title">
          <IonIcon icon={analyticsOutline} aria-hidden="true" />
          {t('progress.composition')}
        </h2>
        <p className="lu-chart-units" aria-hidden="true">
          <span>{kg}</span>
          <span>%</span>
        </p>
        <LineChart
          testId="chart-composition"
          label={t('progress.composition')}
          labels={labels}
          dates={dates}
          series={composition}
          rtl={rtl}
          summary={composition.map(summary)}
        />
      </section>

      {showFitScore && (
        <section className="lu-px-card lu-progress-chart" aria-labelledby="chart-fitscore" data-testid="fitscore-chart">
          <header className="lu-card-head">
            <h2 id="chart-fitscore" className="lu-card-title">
              <IonIcon icon={pulseOutline} aria-hidden="true" />
              {t('progress.fitScoreChart')}
            </h2>
            {/* "72 / 100" is a fraction, so it stays left-to-right in Arabic too. */}
            <span className="lu-chip lu-chip-primary" dir="ltr">
              {`${formatNumber(latest.fitScore)} / ${formatNumber(100)}`}
            </span>
          </header>
          <LineChart
            testId="chart-fitscore"
            label={t('progress.fitScoreChart')}
            labels={labels}
            dates={dates}
            series={[score]}
            startRange={[0, 100]}
            rtl={rtl}
            legend={false}
            summary={[summary(score)]}
          />
        </section>
      )}
    </>
  );
};

export default ProgressCharts;
