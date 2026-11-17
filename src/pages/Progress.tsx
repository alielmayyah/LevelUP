import { lazy, Suspense, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssessmentDto, ProfileDto, ProgressDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import Icon, { type IconName } from '../components/Icon';
import TabPage from '../components/TabPage';
import { formatNumber, numberLocale } from '../i18n/format';
import './progress/Progress.scss';
import MetricInfo, { InfoButton, type InfoTopic } from './progress/MetricInfo';
import ScanCalendar from './progress/ScanCalendar';
import ScanHistory from './progress/ScanHistory';
import { daysBetween, spanOf } from './progress/scanAge';

// The chart is the heaviest part of the page, so it loads after it, behind a skeleton.
const TrendChart = lazy(() => import('./progress/ProgressCharts'));
// The InBody-style analysis sits below the fold, so it loads in its own chunk too.
const BodyComposition = lazy(() => import('./progress/BodyComposition'));

/** What the scan on screen is compared with: the scan before it, a scan the member picked (by id), or nothing. */
type CompareChoice = 'previous' | 'none' | number;

type MainKey = 'weight' | 'muscle' | 'bodyFat';
type MoreKey = 'bmi' | 'visceral' | 'water' | 'protein' | 'minerals' | 'bmr';

interface Metric<K> {
  key: K;
  value: (a: AssessmentDto) => number;
  unit?: 'kg' | '%' | 'kcal';
  digits: number;
  icon: IconName;
  /** Class that sets the metric's hue and its icon's color (Progress.scss). */
  tone: string;
}

/** Which way is good news for a measurement; null when it has no right direction (weight, water, BMI). */
type Better = 'up' | 'down' | null;

interface MainMetric extends Metric<MainKey> {
  better: Better;
}

interface MoreMetric extends Metric<MoreKey> {
  better: Better;
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
    icon: 'bodyFat',
    tone: 'lu-tone-fat',
    better: 'down',
  },
];

/** The rest of the scan: small cards with an icon, name, and value; the ⓘ sheet explains each one. */
const MORE: MoreMetric[] = [
  {
    key: 'water',
    value: (a) => a.totalBodyWaterKg,
    unit: 'kg',
    digits: 1,
    icon: 'drop',
    tone: 'lu-tone-water',
    better: null,
  },
  {
    key: 'protein',
    value: (a) => a.proteinKg,
    unit: 'kg',
    digits: 1,
    icon: 'protein',
    tone: 'lu-tone-protein',
    better: 'up',
  },
  {
    key: 'minerals',
    value: (a) => a.mineralsKg,
    unit: 'kg',
    digits: 1,
    icon: 'gem',
    tone: 'lu-tone-minerals',
    better: 'up',
  },
  { key: 'bmr', value: (a) => a.bmrKcal, unit: 'kcal', digits: 0, icon: 'bolt', tone: 'lu-tone-bmr', better: 'up' },
  { key: 'bmi', value: (a) => a.bmi, digits: 1, icon: 'gauge', tone: 'lu-tone-bmi', better: null },
  {
    key: 'visceral',
    value: (a) => a.visceralFatLevel,
    digits: 0,
    icon: 'abdomen',
    tone: 'lu-tone-visceral',
    better: 'down',
  },
];

const scanDate = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

const STEP =
  'lu-scan-step grid size-11 flex-none cursor-pointer place-items-center rounded-full bg-surface font-inherit text-[1.15rem] text-ink disabled:cursor-default disabled:opacity-40';

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
  const [calendar, setCalendar] = useState(false);
  const [picking, setPicking] = useState(false);
  const [compareChoice, setCompareChoice] = useState<CompareChoice>('previous');
  /** The page opens on the key numbers; body composition and trends wait behind View more. */
  const [details, setDetails] = useState(false);
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
  const previous = list[index + 1] ?? null;
  const chosen =
    typeof compareChoice === 'number' ? list.find((s) => s.id === compareChoice && s.id !== scan?.id) : null;
  /** The scan every change on the page is measured against; null when comparing is off. */
  const before = compareChoice === 'none' ? null : (chosen ?? previous);
  const beforeIndex = before ? list.indexOf(before) : -1;
  const points = progress.status === 'ready' ? progress.data.assessments : [];

  /** A length of time as words: "3 days", "يومين". */
  const spanText = (days: number) => {
    const s = spanOf(days);
    return s ? t(`progress.age.${s.unit}`, { count: s.count }) : '';
  };
  /** How long ago a scan was taken: "Today", "3 days ago". */
  const agoText = (iso: string) => {
    const d = daysBetween(iso, new Date());
    if (d <= 0) return t('progress.age.today');
    if (d === 1) return t('progress.age.yesterday');
    return t('progress.age.ago', { span: spanText(d) });
  };
  /** How far the compared scan sits from the one on screen: "4 weeks before". */
  const gapText = (from: string, to: string) => {
    const d = daysBetween(from, to);
    if (d === 0) return t('progress.age.sameDay');
    return t(d < 0 ? 'progress.age.before' : 'progress.age.after', { span: spanText(d) });
  };

  const unit = (u?: Metric<string>['unit']) => (!u ? '' : u === '%' ? '%' : ` ${t(`units.${u}`)}`);
  /** The same, as plain text (for the info sheet). */
  const valueText = (m: Metric<string>, of: AssessmentDto) => {
    const v = m.value(of);
    return Number.isFinite(v) ? `${formatNumber(v, m.digits)}${unit(m.unit)}` : '—';
  };
  /** A measurement and its unit, or a lone dash when the scan has no value for it. */
  const value = (m: Metric<string>, of: AssessmentDto) => {
    const v = m.value(of);
    if (!Number.isFinite(v)) return '—';
    return (
      <>
        {formatNumber(v, m.digits)}
        {/* The unit is smaller than the number, after a thin space, so the value fits a narrow tile. */}
        <span className="text-[0.7em]">{unit(m.unit).replace(' ', '\u2009')}</span>
      </>
    );
  };

  /** "▲ 0.8 kg", colored by whether that direction is good news. Null when there is no earlier scan. */
  const change = (m: MainMetric | MoreMetric) => {
    if (!scan || !before) return null;
    if (!Number.isFinite(m.value(scan)) || !Number.isFinite(m.value(before))) return null;
    const diff = Math.round((m.value(scan) - m.value(before)) * 10 ** m.digits) / 10 ** m.digits;
    if (diff === 0)
      return {
        text: t('progress.noChange'),
        arrow: '',
        signed: '±0',
        tone: 'text-muted',
        label: t('progress.noChange'),
      };
    const up = diff > 0;
    const good = m.better === null ? null : (m.better === 'up') === up;
    const amount = `${formatNumber(Math.abs(diff), m.digits)}${unit(m.unit)}`;
    return {
      text: amount,
      arrow: up ? '▲' : '▼',
      /** For the small cards: a plain sign, "+0.4 kg" or "−0.2 kg". */
      signed: `${up ? '+' : '−'}${amount}`,
      tone: good === null ? 'text-muted' : good ? 'text-success' : 'text-danger',
      label: t(up ? 'progress.changeUp' : 'progress.changeDown', { amount }),
    };
  };

  return (
    <TabPage
      testId="page-progress"
      title={t('tabs.progress')}
      subtitle={t('progress.journey')}
      onRefresh={reloadAll}
      titleIcon={<Icon className="lu-title-icon flex-none text-[0.75em]" name="chart" />}
      actions={
        // The scan card names the scan on screen; the header only offers the full list.
        list.length > 1 && (
          <button
            type="button"
            className="lu-all-scans inline-flex min-h-11 min-w-11 flex-none cursor-pointer items-center justify-center gap-2 rounded-full bg-surface px-3.5 font-inherit text-[0.9rem] font-semibold text-primary max-[359px]:px-0 dark:text-secondary"
            onClick={() => setShowAll(true)}
            data-testid="view-all-scans"
          >
            <Icon className="text-[1.15rem] rtl:-scale-x-100" name="history" />
            {/* Icon only on the narrowest phones, so the page title keeps its line; the name stays for screen readers. */}
            <span className="max-[359px]:sr-only">{t('progress.viewAll', { n: formatNumber(list.length) })}</span>
          </button>
        )
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
        <div className="lu-card lu-state" data-testid="progress-empty">
          <Icon className="lu-tone-calendar text-[3rem]" name="chart" />
          <p>{t('progress.empty')}</p>
        </div>
      )}

      {!loading && !failed && scan && me.status === 'ready' && (
        <div className="grid gap-3.5 wide:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] wide:items-start">
          <div className="grid gap-5">
            <section
              className="lu-scan-card relative grid gap-3 p-3.5 md:p-5"
              aria-labelledby="latest-scan"
              data-testid="latest-scan"
            >
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
                  <Icon className="rtl:-scale-x-100" name="chevronBack" />
                </button>
                <div className="grid min-w-0 flex-1 justify-items-center text-center" aria-live="polite">
                  {/* The scan's date is the title; tapping it opens the calendar of scans. */}
                  <h2 id="latest-scan" className="lu-card-title m-0" data-testid="scan-title">
                    <button
                      type="button"
                      className="lu-date-button inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 font-inherit text-inherit"
                      onClick={() => setCalendar(true)}
                      aria-haspopup="dialog"
                      data-testid="scan-calendar-open"
                    >
                      {scanDate(scan.takenAt)}
                      <Icon className="lu-tone-calendar flex-none text-[1.05rem]" name="calendar" />
                    </button>
                  </h2>
                  {/* Tags: whether this is the newest scan, and how old it is. */}
                  <div className="flex flex-wrap justify-center gap-1.5" data-testid="scan-tags">
                    {index === 0 && (
                      <span className="lu-chip lu-chip-primary" data-testid="scan-latest">
                        {t('progress.latest')}
                      </span>
                    )}
                    <span className="lu-chip text-muted" data-testid="scan-age">
                      {agoText(scan.takenAt)}
                    </span>
                  </div>
                  {/* Just the date on screen; screen readers also hear which scan it is. */}
                  <span className="sr-only" data-testid="scan-date">
                    {t('progress.scanPosition', {
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
                  <Icon className="rtl:-scale-x-100" name="chevronForward" />
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
                      <dt className="grid justify-items-center gap-1 text-[0.75rem] font-bold text-muted">
                        {/* Inside the <dt>: a <dl> may only hold dt/dd groups. */}
                        <InfoButton
                          className="absolute -end-1 -top-1"
                          label={t('progress.about', { metric: t(`progress.metric.${m.key}`) })}
                          onClick={() => setInfo({ ...m, value: valueText(m, scan) })}
                          testId={`info-${m.key}`}
                        />
                        <Icon className="text-[1.6rem]" name={m.icon} />
                        {t(`progress.metric.${m.key}`)}
                      </dt>
                      <dd className="lu-display m-0 text-[clamp(1.3rem,6vw,1.6rem)] leading-none whitespace-nowrap text-ink">
                        {value(m, scan)}
                      </dd>
                      <dd
                        className="m-0 min-h-[1.2em] text-[0.78rem] leading-tight font-bold"
                        data-testid={`change-${m.key}`}
                      >
                        {c ? (
                          <span className={c.tone}>
                            <bdi aria-hidden="true">
                              {c.arrow && `${c.arrow} `}
                              {c.text}
                            </bdi>
                            {/* Screen readers hear the full sentence instead of an arrow. */}
                            <span className="sr-only">{c.label}</span>
                          </span>
                        ) : (
                          <span className="font-semibold text-muted">
                            {list.length === 1
                              ? t('progress.changeLater')
                              : compareChoice === 'none'
                                ? ''
                                : t('progress.firstScan')}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              {list.length > 1 && (
                <div
                  className="lu-compare flex items-center gap-2.5 rounded-lg py-1.5 ps-2.5 pe-1.5"
                  data-testid="change-caption"
                >
                  <Icon className="lu-tone-calendar flex-none text-[1.4rem]" name="calendar" />
                  <p className="m-0 grid min-w-0 flex-1 leading-tight">
                    <span className="text-[0.72rem] font-bold text-muted">{t('progress.comparedWith')}</span>
                    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.9rem] font-bold text-ink">
                      {before ? scanDate(before.takenAt) : t('progress.compareOffShort')}
                      {before && (
                        <span className="lu-chip text-muted" data-testid="compare-gap">
                          {gapText(scan.takenAt, before.takenAt)}
                        </span>
                      )}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="lu-compare-button min-h-11 flex-none cursor-pointer rounded-md px-3.5 font-inherit text-[0.85rem] font-bold"
                    onClick={() => setPicking(true)}
                    data-testid="compare-open"
                  >
                    {before ? t('progress.compareChange') : t('progress.comparePick')}
                  </button>
                </div>
              )}
            </section>

            <section className="grid gap-3" aria-labelledby="more-title" data-testid="more-metrics">
              <h2
                id="more-title"
                className="lu-display m-0 flex items-center gap-2 text-[1.7rem] leading-none text-ink"
              >
                <Icon className="lu-title-icon flex-none text-[0.8em]" name="chart" />
                {t('progress.more')}
              </h2>
              <dl className="m-0 grid grid-cols-2 gap-2.5 md:grid-cols-3">
                {MORE.map((m) => (
                  <div
                    key={m.key}
                    className={`lu-more-card relative grid grid-cols-[auto_1fr] content-start items-baseline gap-x-2 gap-y-1.5 rounded-lg p-2.5 pe-9 ${m.tone}`}
                    data-testid={`metric-${m.key}`}
                  >
                    <dt className="col-span-full grid gap-1">
                      {/* Inside the <dt>: a <dl> may only hold dt/dd groups. */}
                      <InfoButton
                        className="absolute -end-1 -top-1"
                        label={t('progress.about', { metric: t(`progress.metric.${m.key}`) })}
                        onClick={() => setInfo({ ...m, value: valueText(m, scan) })}
                        testId={`info-${m.key}`}
                      />
                      <span className="flex items-center gap-1.5 text-[0.85rem] font-bold text-ink">
                        <Icon className="flex-none text-[1.25rem]" name={m.icon} />
                        {t(`progress.metric.${m.key}`)}
                      </span>
                    </dt>
                    <dd className="lu-display m-0 text-[1.45rem] leading-none whitespace-nowrap text-ink">
                      {value(m, scan)}
                    </dd>
                    {(() => {
                      // The change since the scan before, with a sign; nothing on the first scan.
                      const c = change(m);
                      return c ? (
                        <dd
                          className={`m-0 text-[0.78rem] font-bold whitespace-nowrap ${c.tone}`}
                          data-testid={`change-${m.key}`}
                        >
                          <bdi aria-hidden="true">{c.signed}</bdi>
                          <span className="sr-only">{c.label}</span>
                        </dd>
                      ) : null;
                    })()}
                  </div>
                ))}
              </dl>
            </section>

            <button
              type="button"
              className="lu-compare-button flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 font-inherit text-[0.95rem] font-bold"
              aria-expanded={details}
              aria-controls="progress-details"
              onClick={() => setDetails((d) => !d)}
              data-testid="progress-more"
            >
              {details ? t('progress.lessDetails') : t('progress.moreDetails')}
              <Icon
                className={`text-[1.1rem] transition-transform duration-150 motion-reduce:transition-none ${details ? 'rotate-180' : ''}`}
                name="chevronDown"
              />
            </button>
          </div>

          <div id="progress-details" className="grid gap-[18px] [&[hidden]]:hidden" hidden={!details}>
            {details && (
              <>
                <Suspense fallback={<div className="lu-skeleton-card min-h-96" data-testid="body-comp-loading" />}>
                  <BodyComposition scan={scan} compare={before} heightCm={me.data.heightCm} sex={me.data.sex} />
                </Suspense>
                {points.length < 2 ? (
                  <p className="lu-card lu-state" data-testid="second-scan">
                    {t('progress.secondScan')}
                  </p>
                ) : (
                  <Suspense fallback={<div className="lu-skeleton-card min-h-60" data-testid="charts-loading" />}>
                    <TrendChart points={points} showFitScore={me.data.showFitScore} />
                  </Suspense>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <MetricInfo topic={info} onClose={closeInfo} />
      <ScanHistory open={showAll} scans={list} current={index} onPick={setPicked} onClose={() => setShowAll(false)} />
      <ScanCalendar
        open={calendar}
        scans={list}
        current={index}
        onPick={setPicked}
        onClose={() => setCalendar(false)}
      />
      <ScanHistory
        mode="compare"
        open={picking}
        scans={list}
        current={beforeIndex}
        showing={index}
        onPick={(i) => setCompareChoice(list[i].id)}
        onNone={() => setCompareChoice('none')}
        onClose={() => setPicking(false)}
      />
    </TabPage>
  );
};

export default Progress;
