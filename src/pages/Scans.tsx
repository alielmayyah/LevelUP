import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { AssessmentDto, DashboardDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import Icon from '../components/Icon';
import TabPage from '../components/TabPage';
import { Button, FeedCard, StateCard } from '../components/ui';
import { formatDay, formatFromNow } from './journey/dates';
import TrendLanes from './scans/TrendLanes';

const placeOf = (a: AssessmentDto) =>
  [a.origin?.place?.name, a.origin?.device ? `${a.origin.device.brand} ${a.origin.device.model}` : null]
    .filter(Boolean)
    .join(' · ');

/**
 * Scans tab: muscle and fat over time on one true date axis, then every scan
 * as a stop on the timeline, the next one dashed on top. Each opens its report.
 */
const Scans: React.FC = () => {
  const { t } = useTranslation();
  const dashboard = useApi<DashboardDto>('/me/dashboard');
  const list = useApi<AssessmentDto[]>('/me/assessments');
  useRefreshOnEnter(() => Promise.all([dashboard.reload(), list.reload()]));

  const j = dashboard.status === 'ready' ? (dashboard.data.journey ?? null) : null;
  const newestFirst = list.status === 'ready' ? list.data : null;
  const oldestFirst = newestFirst ? [...newestFirst].reverse() : null;
  const failed = dashboard.status === 'error' || list.status === 'error';
  const loading = !failed && (!j || !oldestFirst);
  const sameMachine = new Map(j?.stops.map((s) => [s.id, s.sameMachine]) ?? []);

  return (
    <TabPage
      testId="page-scans"
      title={t('tabs.scans')}
      subtitle={t('scans.subtitle')}
      onRefresh={() => Promise.all([dashboard.reload(), list.reload()])}
    >
      {loading && <div className="lu-skeleton-card min-h-[260px] rounded-[20px]" aria-busy="true" />}
      {failed && (
        <StateCard
          icon="warning"
          tone="attention"
          title={t('journey.errorTitle')}
          message={t('progress.error')}
          action={
            <Button
              variant="secondary"
              icon="refresh"
              onClick={() => void Promise.all([dashboard.retry(), list.retry()])}
            >
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {j && oldestFirst && oldestFirst.length === 0 && (
        <StateCard
          icon="scan"
          tone="brand"
          title={t('journey.empty.title')}
          message={t('journey.empty.message')}
          testId="scans-empty"
        />
      )}
      {j && oldestFirst && newestFirst && oldestFirst.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <FeedCard icon="chart" iconTone="brand" title={t('scans.trends')} testId="scans-trends">
            {oldestFirst.length > 1 ? (
              <>
                <TrendLanes scans={oldestFirst} journey={j} />
                <p className="m-0 text-caption text-muted">{t('scans.band')}</p>
              </>
            ) : (
              <p className="m-0 text-body text-muted" data-testid="scans-one">
                {t('scans.oneScan')}
              </p>
            )}
          </FeedCard>

          <FeedCard icon="history" iconTone="brand" title={t('scans.timeline')} testId="scans-timeline">
            <ol className="m-0 grid list-none gap-1 p-0">
              {j.nextScanDue && (
                <li
                  className="flex min-h-14 items-center gap-3 rounded-[14px] border border-dashed border-dash px-3"
                  data-testid="timeline-next"
                >
                  <Icon name="calendar" className="flex-none text-muted" />
                  <span className="grid flex-1">
                    <span className="text-label text-ink">{t('scans.next')}</span>
                    <span className="text-caption text-muted">
                      {formatDay(j.nextScanDue)} · {formatFromNow(j.nextScanDue)}
                    </span>
                  </span>
                </li>
              )}
              {newestFirst.map((a, i) => {
                const n = newestFirst.length - i;
                const other = sameMachine.get(a.id) === false;
                return (
                  <li key={a.id}>
                    <Link
                      to={`/tabs/scans/${a.id}`}
                      className="lu-press lu-focus flex min-h-14 items-center gap-3 rounded-[14px] px-3 text-ink no-underline"
                      data-testid="timeline-scan"
                    >
                      <span
                        className={`grid size-9 flex-none place-items-center rounded-full text-caption ${i === 0 ? 'bg-brand-strong text-on-brand' : 'bg-surface-3 text-muted'}`}
                        aria-hidden="true"
                      >
                        {n}
                      </span>
                      <span className="grid min-w-0 flex-1">
                        <span className="text-label text-ink">
                          {formatDay(a.takenAt)} · {t('scans.stop', { n })}
                        </span>
                        <span className="truncate text-caption text-muted">
                          {other ? t('scans.otherMachine') : placeOf(a)}
                        </span>
                      </span>
                      <Icon name="chevronForward" className="flex-none text-muted rtl:-scale-x-100" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </FeedCard>
        </div>
      )}
    </TabPage>
  );
};

export default Scans;
