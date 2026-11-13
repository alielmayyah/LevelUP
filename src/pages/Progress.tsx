import { IonIcon } from '@ionic/react';
import {
  accessibilityOutline,
  diamondOutline,
  eggOutline,
  flashOutline,
  layersOutline,
  scaleOutline,
  scanOutline,
  waterOutline,
} from 'ionicons/icons';
import { lazy, Suspense, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssessmentDto, ProfileDto, ProgressDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import TabPage from '../components/TabPage';
import { formatNumber, numberLocale } from '../i18n/format';
import './progress/Progress.css';

// The charts are the heaviest part of the page, so they load after it, behind a skeleton.
const ProgressCharts = lazy(() => import('./progress/ProgressCharts'));

type MetricKey = 'weight' | 'muscle' | 'bodyFat' | 'bmi' | 'visceral' | 'water' | 'protein' | 'minerals' | 'bmr';

interface Metric {
  key: MetricKey;
  value: (a: AssessmentDto) => number;
  unit?: 'kg' | '%' | 'kcal';
  digits: number;
  icon: string | PixelIconName;
  pixel?: boolean;
  tone?: 'fat' | 'muscle';
}

const METRICS: Metric[] = [
  { key: 'weight', value: (a) => a.weightKg, unit: 'kg', digits: 1, icon: scaleOutline },
  {
    key: 'muscle',
    value: (a) => a.skeletalMuscleKg,
    unit: 'kg',
    digits: 1,
    icon: 'muscle',
    pixel: true,
    tone: 'muscle',
  },
  { key: 'bodyFat', value: (a) => a.bodyFatPct, unit: '%', digits: 1, icon: 'flame', pixel: true, tone: 'fat' },
  { key: 'bmi', value: (a) => a.bmi, digits: 1, icon: accessibilityOutline },
  { key: 'visceral', value: (a) => a.visceralFatLevel, digits: 0, icon: layersOutline },
  { key: 'water', value: (a) => a.totalBodyWaterKg, unit: 'kg', digits: 1, icon: waterOutline },
  { key: 'protein', value: (a) => a.proteinKg, unit: 'kg', digits: 1, icon: eggOutline },
  { key: 'minerals', value: (a) => a.mineralsKg, unit: 'kg', digits: 1, icon: diamondOutline },
  { key: 'bmr', value: (a) => a.bmrKcal, unit: 'kcal', digits: 0, icon: flashOutline },
];

const scanDate = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

/** Progress tab: the latest scan's 9 measurements and trends over time. */
const Progress: React.FC = () => {
  const { t } = useTranslation();
  const progress = useApi<ProgressDto>('/me/progress');
  const scans = useApi<AssessmentDto[]>('/me/assessments');
  const me = useApi<ProfileDto>('/me');

  const { reload: reloadProgress } = progress;
  const { reload: reloadScans } = scans;
  const { reload: reloadMe } = me;
  const reloadAll = useCallback(
    () => Promise.all([reloadProgress(), reloadScans(), reloadMe()]),
    [reloadProgress, reloadScans, reloadMe],
  );
  useRefreshOnEnter(reloadAll);

  const failed = [progress, scans, me].some((r) => r.status === 'error');
  const loading = [progress, scans, me].some((r) => r.status === 'loading');
  const latest = scans.status === 'ready' ? (scans.data[0] ?? null) : null;
  const points = progress.status === 'ready' ? progress.data.assessments : [];

  const unit = (u?: Metric['unit']) => (!u ? '' : u === '%' ? '%' : ` ${t(`units.${u}`)}`);

  return (
    <TabPage testId="page-progress" title={t('tabs.progress')} subtitle={t('progress.subtitle')} onRefresh={reloadAll}>
      {failed && !loading && (
        <div className="lu-state" role="alert">
          <p>{t('progress.error')}</p>
          <CtaButton onClick={() => void Promise.all([progress.retry(), scans.retry(), me.retry()])}>
            {t('common.retry')}
          </CtaButton>
        </div>
      )}

      {loading && !failed && (
        <div className="lu-progress-grid" aria-busy="true">
          <div className="lu-skeleton-card lu-skeleton-scan" />
          <div className="lu-skeleton-card lu-skeleton-chart" />
        </div>
      )}

      {!loading && !failed && !latest && (
        <div className="lu-px-card lu-state" data-testid="progress-empty">
          <IonIcon icon={scanOutline} aria-hidden="true" />
          <p>{t('progress.empty')}</p>
        </div>
      )}

      {!loading && !failed && latest && me.status === 'ready' && (
        <div className="lu-progress-grid">
          <section className="lu-px-card lu-scan" aria-labelledby="latest-scan" data-testid="latest-scan">
            <header className="lu-card-head">
              <h2 id="latest-scan" className="lu-card-title">
                <IonIcon icon={scanOutline} aria-hidden="true" />
                {t('progress.latest')}
              </h2>
              <span className="lu-scan-date">{scanDate(latest.takenAt)}</span>
            </header>
            <dl className="lu-scan-grid">
              {METRICS.map((m) => (
                <div
                  key={m.key}
                  className={`lu-scan-cell${m.tone ? ` lu-scan-${m.tone}` : ''}`}
                  data-testid={`metric-${m.key}`}
                >
                  <dt>
                    {m.pixel ? (
                      <PixelIcon name={m.icon as PixelIconName} />
                    ) : (
                      <IonIcon icon={m.icon} aria-hidden="true" />
                    )}
                    {t(`progress.metric.${m.key}`)}
                  </dt>
                  <dd className="lu-display">
                    {formatNumber(m.value(latest), m.digits)}
                    {unit(m.unit)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {points.length < 2 ? (
            <p className="lu-px-card lu-state" data-testid="second-scan">
              {t('progress.secondScan')}
            </p>
          ) : (
            <Suspense fallback={<div className="lu-skeleton-card lu-skeleton-chart" data-testid="charts-loading" />}>
              <ProgressCharts points={points} showFitScore={me.data.showFitScore} />
            </Suspense>
          )}
        </div>
      )}
    </TabPage>
  );
};

export default Progress;
