import { useTranslation } from 'react-i18next';

import type { DashboardDto, ScanChange } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import Icon from '../components/Icon';
import TabPage from '../components/TabPage';
import { Button, FeedCard, StateCard } from '../components/ui';
import ChangeRow, { type ChangeKey } from './journey/ChangeRow';
import { formatDay } from './journey/dates';

const ROWS: ChangeKey[] = ['muscleKg', 'fatKg', 'fatPct', 'weightKg'];

/** Two scans side by side: the machine match first, then each change against the machine's noise. */
const Comparison: React.FC<{ change: ScanChange; title: string; testId: string }> = ({ change, title, testId }) => {
  const { t } = useTranslation();
  const allSame = ROWS.every((k) => change[k].verdict === 'same');
  return (
    <FeedCard
      icon="compare"
      iconTone="brand"
      title={title}
      subtitle={`${formatDay(change.fromAt)} · ${formatDay(change.toAt)}`}
      testId={testId}
    >
      <p
        className={`m-0 flex items-center gap-2 text-label ${change.sameMachine ? 'text-good' : 'text-attention'}`}
        data-testid={`${testId}-machine`}
      >
        <Icon name={change.sameMachine ? 'checkCircle' : 'warning'} className="flex-none" />
        {t(change.sameMachine ? 'compare.sameMachine' : 'compare.otherMachine')}
      </p>
      <div className="grid gap-3 border-t border-line pt-3">
        {ROWS.map((k) => (
          <ChangeRow key={k} metric={k} change={change[k]} />
        ))}
      </div>
      {allSame && (
        <p className="m-0 text-label font-normal text-muted" data-testid={`${testId}-all-same`}>
          {t('compare.allSame')}
        </p>
      )}
    </FeedCard>
  );
};

/**
 * Compare tab, first version: the latest scan against the one before and
 * against the first. Picking any two scans comes with the Scans rebuild.
 */
const Compare: React.FC = () => {
  const { t } = useTranslation();
  const dashboard = useApi<DashboardDto>('/me/dashboard');
  useRefreshOnEnter(dashboard.reload);
  const j = dashboard.status === 'ready' ? (dashboard.data.journey ?? null) : null;

  return (
    <TabPage
      testId="page-compare"
      title={t('tabs.compare')}
      subtitle={t('compare.subtitle')}
      onRefresh={dashboard.reload}
    >
      {dashboard.status === 'loading' && (
        <div className="lu-skeleton-card min-h-[260px] rounded-[20px]" aria-busy="true" />
      )}
      {dashboard.status === 'error' && (
        <StateCard
          icon="warning"
          tone="attention"
          title={t('journey.errorTitle')}
          message={t('home.error')}
          action={
            <Button variant="secondary" icon="refresh" onClick={() => void dashboard.retry()}>
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {dashboard.status === 'ready' && !j?.sinceLast && (
        <StateCard
          icon="compare"
          tone="brand"
          title={t('compare.needTwo.title')}
          message={t('compare.needTwo.message')}
          testId="compare-need-two"
        />
      )}
      {j?.sinceLast && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <Comparison change={j.sinceLast} title={t('compare.last')} testId="compare-last" />
          {j.sinceFirst && j.stops.length > 2 && (
            <Comparison change={j.sinceFirst} title={t('compare.first')} testId="compare-first" />
          )}
        </div>
      )}
    </TabPage>
  );
};

export default Compare;
