import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward, listOutline, scanOutline } from 'ionicons/icons';
import { lazy, Suspense, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssessmentDto, ProfileDto, ProgressDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import TabPage from '../components/TabPage';
import { formatNumber, numberLocale } from '../i18n/format';
import './progress/Progress.scss';
import MetricInfo, { InfoButton, type InfoTopic } from './progress/MetricInfo';
import ScanHistory from './progress/ScanHistory';

// The chart is the heaviest part of the page, so it loads after it, behind a skeleton.
const TrendChart = lazy(() => import('./progress/ProgressCharts'));

type MainKey = 'weight' | 'muscle' | 'bodyFat';
type MoreKey = 'bmi' | 'visceral' | 'water' | 'protein' | 'minerals' | 'bmr';

interface Metric<K> {
  key: K;
  value: (a: AssessmentDto) => number;
  unit?: 'kg' | '%' | 'kcal';
  digits: number;
  icon: PixelIconName;
  /** Class that sets the metric's hue and its pixel icon's colors (Progress.scss). */
  tone: string;
}

interface MainMetric extends Metric<MainKey> {
  /** Which way is good news: muscle up, body fat down. Weight has no right direction. */
  better: 'up' | 'down' | null;
}

/** The three numbers members care about: big, with their change. */
const MAIN: MainMetric[] = [
  {
    key: 'weight',
    value: (a) => a.weightKg,
    unit: 'kg',
    digits: 1,
    icon: 'scale',
    tone: 'lu-tone-weight',
    better: null,
  },
  {
    key: 'muscle',
    value: (a) => a.skeletalMuscleKg,
    unit: 'kg',
    digits: 1,
    icon: 'muscle',
    tone: 'lu-tone-muscle',
    better: 'up',
  },
  {
    key: 'bodyFat',
    value: (a) => a.bodyFatPct,
    unit: '%',
    digits: 1,
    icon: 'flame',
    tone: 'lu-tone-fat',
    better: 'down',
  },
];

/** The rest of the scan: smaller cards, each with its own icon and a plain-language line. */
const MORE: Metric<MoreKey>[] = [
  { key: 'water', value: (a) => a.totalBodyWaterKg, unit: 'kg', digits: 1, icon: 'drop', tone: 'lu-tone-water' },
  { key: 'protein', value: (a) => a.proteinKg, unit: 'kg', digits: 1, icon: 'drumstick', tone: 'lu-tone-protein' },
  { key: 'minerals', value: (a) => a.mineralsKg, unit: 'kg', digits: 1, icon: 'gem', tone: 'lu-tone-minerals' },
  { key: 'bmr', value: (a) => a.bmrKcal, unit: 'kcal', digits: 0, icon: 'bolt', tone: 'lu-tone-bmr' },
  { key: 'bmi', value: (a) => a.bmi, digits: 1, icon: 'ruler', tone: 'lu-tone-bmi' },
  { key: 'visceral', value: (a) => a.visceralFatLevel, digits: 0, icon: 'heart', tone: 'lu-tone-visceral' },
];

const scanDate = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

const STEP =
  'lu-scan-step grid size-11 flex-none cursor-pointer place-items-center border-0 bg-surface-2 font-inherit text-[1.15rem] text-ink disabled:cursor-default disabled:opacity-40';

/**
 * Progress tab: one scan at a time (the latest by default, earlier ones a tap
 * away), its three key numbers with their change, the other six with icons,
 * and one trend chart.
 */
const Progress: React.FC = () => {
  const { t } = useTranslation();
  const progress = useApi<ProgressDto>('/me/progress');
  const scans = useApi<AssessmentDto[]>('/me/assessments');
  const me = useApi<ProfileDto>('/me');
  /** Index into the scans, newest first: 0 is the latest. */
  const [picked, setPicked] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [info, setInfo] = useState<InfoTopic | null>(null);
  const closeInfo = useCallback(() => setInfo(null), []);

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
  const list = scans.status === 'ready' ? scans.data : [];
  const index = Math.min(picked, Math.max(list.length - 1, 0));
  const scan = list[index] ?? null;
  const before = list[index + 1] ?? null;
  const latest = list[0] ?? null;
  const points = progress.status === 'ready' ? progress.data.assessments : [];

  const unit = (u?: Metric<string>['unit']) => (!u ? '' : u === '%' ? '%' : ` ${t(`units.${u}`)}`);

  /** "▲ 0.8 kg", colored by whether that direction is good news. Null when there is no earlier scan. */
  const change = (m: MainMetric) => {
    if (!scan || !before) return null;
    const diff = Math.round((m.value(scan) - m.value(before)) * 10 ** m.digits) / 10 ** m.digits;
    if (diff === 0)
      return { text: t('progress.noChange'), arrow: '', tone: 'text-muted', label: t('progress.noChange') };
    const up = diff > 0;
    const good = m.better === null ? null : (m.better === 'up') === up;
    const amount = `${formatNumber(Math.abs(diff), m.digits)}${unit(m.unit)}`;
    return {
      text: amount,
      arrow: up ? '▲' : '▼',
      tone: good === null ? 'text-muted' : good ? 'text-success' : 'text-danger',
      label: t(up ? 'progress.changeUp' : 'progress.changeDown', { amount }),
    };
  };

  return (
    <TabPage
      testId="page-progress"
      title={t('tabs.progress')}
      subtitle={latest ? t('progress.lastScan', { date: scanDate(latest.takenAt) }) : t('progress.subtitle')}
      onRefresh={reloadAll}
      actions={
        list.length > 1 ? (
          <button
            type="button"
            className="lu-all-scans inline-flex min-h-11 flex-none cursor-pointer items-center gap-1.5 border-0 bg-surface px-3 font-inherit text-[0.85rem] font-extrabold text-primary dark:text-secondary"
            onClick={() => setShowAll(true)}
            data-testid="view-all-scans"
          >
            <IonIcon className="text-[1.1rem]" icon={listOutline} aria-hidden="true" />
            {t('progress.viewAll', { n: formatNumber(list.length) })}
          </button>
        ) : undefined
      }
    >
      {failed && !loading && (
        <div className="lu-state" role="alert">
          <p>{t('progress.error')}</p>
          <CtaButton onClick={() => void Promise.all([progress.retry(), scans.retry(), me.retry()])}>
            {t('common.retry')}
          </CtaButton>
        </div>
      )}

      {loading && !failed && (
        <div className="grid gap-3.5" aria-busy="true">
          <div className="lu-skeleton-card min-h-[140px]" />
          <div className="lu-skeleton-card min-h-60" />
        </div>
      )}

      {!loading && !failed && !scan && (
        <div className="lu-px-card lu-state" data-testid="progress-empty">
          <IonIcon icon={scanOutline} aria-hidden="true" />
          <p>{t('progress.empty')}</p>
        </div>
      )}

      {!loading && !failed && scan && me.status === 'ready' && (
        <div className="grid gap-3.5 wide:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] wide:items-start">
          <section className="lu-px-card grid gap-3" aria-labelledby="latest-scan" data-testid="latest-scan">
            {/* Scan picker: older on the start side, newer on the end side. */}
            <header className="flex items-center gap-2">
              <button
                type="button"
                className={STEP}
                onClick={() => setPicked(index + 1)}
                disabled={!before}
                aria-label={t('progress.olderScan')}
                data-testid="scan-older"
              >
                <IonIcon className="rtl:-scale-x-100" icon={chevronBack} aria-hidden="true" />
              </button>
              <div className="grid min-w-0 flex-1 justify-items-center text-center" aria-live="polite">
                <h2 id="latest-scan" className="lu-card-title m-0" data-testid="scan-title">
                  {index === 0 ? t('progress.latest') : t('progress.earlierScan')}
                </h2>
                <span className="text-[0.8rem] font-bold text-muted" data-testid="scan-date">
                  {t('progress.scanPosition', {
                    date: scanDate(scan.takenAt),
                    n: formatNumber(list.length - index),
                    total: formatNumber(list.length),
                  })}
                </span>
              </div>
              <button
                type="button"
                className={STEP}
                onClick={() => setPicked(index - 1)}
                disabled={index === 0}
                aria-label={t('progress.newerScan')}
                data-testid="scan-newer"
              >
                <IonIcon className="rtl:-scale-x-100" icon={chevronForward} aria-hidden="true" />
              </button>
            </header>

            <dl className="m-0 grid grid-cols-3 gap-2">
              {MAIN.map((m) => {
                const c = change(m);
                return (
                  <div
                    key={m.key}
                    className={`lu-scan-tile relative grid content-start justify-items-center gap-1 rounded-lg px-1 pt-2.5 pb-2 text-center ${m.tone}`}
                    data-testid={`metric-${m.key}`}
                  >
                    <InfoButton
                      className="absolute -end-1 -top-1"
                      label={t('progress.about', { metric: t(`progress.metric.${m.key}`) })}
                      onClick={() => setInfo(m)}
                      testId={`info-${m.key}`}
                    />
                    <dt className="grid justify-items-center gap-1 text-[0.75rem] font-bold text-muted">
                      <PixelIcon className="text-[1.6rem]" name={m.icon} />
                      {t(`progress.metric.${m.key}`)}
                    </dt>
                    <dd className="lu-display m-0 text-[clamp(1.3rem,6vw,1.6rem)] leading-none whitespace-nowrap text-ink">
                      {formatNumber(m.value(scan), m.digits)}
                      {/* The unit is smaller than the number, so the value fits a narrow tile. */}
                      <span className="text-[0.7em]">{unit(m.unit)}</span>
                    </dd>
                    <dd
                      className="m-0 min-h-[1.2em] text-[0.78rem] leading-tight font-extrabold"
                      data-testid={`change-${m.key}`}
                    >
                      {c ? (
                        <span className={c.tone}>
                          <span aria-hidden="true">
                            {c.arrow && `${c.arrow} `}
                            {c.text}
                          </span>
                          {/* Screen readers hear the full sentence instead of an arrow. */}
                          <span className="sr-only">{c.label}</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-muted">
                          {list.length === 1 ? t('progress.changeLater') : t('progress.firstScan')}
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {before && (
              <p className="m-0 text-center text-[0.8rem] font-semibold text-muted" data-testid="change-caption">
                {t('progress.changeCaption', { date: scanDate(before.takenAt) })}
              </p>
            )}

            <h3 className="m-0 mt-1 text-[0.8rem] font-extrabold tracking-[0.06em] text-muted uppercase ar:tracking-normal">
              {t('progress.more')}
            </h3>
            <dl className="m-0 grid grid-cols-2 gap-2 md:grid-cols-3">
              {MORE.map((m) => (
                <div
                  key={m.key}
                  className={`lu-more-card relative grid content-start gap-1 rounded-lg p-2.5 pe-9 ${m.tone}`}
                  data-testid={`metric-${m.key}`}
                >
                  <InfoButton
                    className="absolute -end-1 -top-1"
                    label={t('progress.about', { metric: t(`progress.metric.${m.key}`) })}
                    onClick={() => setInfo(m)}
                    testId={`info-${m.key}`}
                  />
                  <dt className="grid gap-1">
                    <span className="flex items-center gap-1.5 text-[0.85rem] font-extrabold text-ink">
                      <PixelIcon className="flex-none text-[1.25rem]" name={m.icon} />
                      {t(`progress.metric.${m.key}`)}
                    </span>
                  </dt>
                  <dd className="lu-display m-0 text-[1.35rem] leading-none whitespace-nowrap text-ink">
                    {formatNumber(m.value(scan), m.digits)}
                    <span className="text-[0.7em]">{unit(m.unit)}</span>
                  </dd>
                  {/* A plain-language line, so numbers like "Visceral fat 9" mean something. */}
                  <dd className="m-0 text-[0.75rem] leading-snug font-semibold text-muted">
                    {t(`progress.hint.${m.key}`)}
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
            <Suspense fallback={<div className="lu-skeleton-card min-h-60" data-testid="charts-loading" />}>
              <TrendChart points={points} showFitScore={me.data.showFitScore} />
            </Suspense>
          )}
        </div>
      )}
      <MetricInfo topic={info} onClose={closeInfo} />
      <ScanHistory open={showAll} scans={list} current={index} onPick={setPicked} onClose={() => setShowAll(false)} />
    </TabPage>
  );
};

export default Progress;
