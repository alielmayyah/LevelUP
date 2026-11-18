import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssessmentDto, ScanChange } from '../api/types';
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

/** A native picker: the platform's own wheel on phones, 16 px so iOS doesn't zoom. */
const ScanPicker: React.FC<{
  label: string;
  scans: AssessmentDto[];
  value: number;
  onChange: (id: number) => void;
  testId: string;
}> = ({ label, scans, value, onChange, testId }) => {
  const id = useId();
  return (
    <div className="grid min-w-0 flex-1 gap-1">
      <label htmlFor={id} className="text-label text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lu-focus min-h-11 w-full rounded-[12px] border border-line bg-surface-2 px-3 text-[1rem] text-ink"
        data-testid={testId}
      >
        {scans.map((a, i) => (
          <option key={a.id} value={a.id}>
            {formatDay(a.takenAt)} · {scans.length - i}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Compare tab: any two scans side by side. Opens on the latest against the
 * one before; shortcuts jump to the latest against the first. The API says
 * which changes are real for that machine.
 */
const Compare: React.FC = () => {
  const { t } = useTranslation();
  const list = useApi<AssessmentDto[]>('/me/assessments');
  useRefreshOnEnter(list.reload);
  const newestFirst = list.status === 'ready' ? list.data : null;
  // The member's own pick; until they pick, the latest against the one before.
  const [picked, setPicked] = useState<{ from: number; to: number } | null>(null);
  const latestId = newestFirst?.[0]?.id;
  const previousId = newestFirst?.[1]?.id;
  const ids = new Set(newestFirst?.map((a) => a.id));
  const pair =
    picked && ids.has(picked.from) && ids.has(picked.to)
      ? picked
      : latestId !== undefined && previousId !== undefined
        ? { from: previousId, to: latestId }
        : null;

  const valid = pair && pair.from !== pair.to;
  const change = useApi<ScanChange>(valid ? `/me/compare/${pair.from}/${pair.to}` : null);
  const firstId = newestFirst?.[newestFirst.length - 1]?.id;

  return (
    <TabPage testId="page-compare" title={t('tabs.compare')} subtitle={t('compare.subtitle')} onRefresh={list.reload}>
      {list.status === 'loading' && <div className="lu-skeleton-card min-h-[260px] rounded-[20px]" aria-busy="true" />}
      {list.status === 'error' && (
        <StateCard
          icon="warning"
          tone="attention"
          title={t('journey.errorTitle')}
          message={t('progress.error')}
          action={
            <Button variant="secondary" icon="refresh" onClick={() => void list.retry()}>
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {newestFirst && newestFirst.length < 2 && (
        <StateCard
          icon="compare"
          tone="brand"
          title={t('compare.needTwo.title')}
          message={t('compare.needTwo.message')}
          testId="compare-need-two"
        />
      )}
      {newestFirst && newestFirst.length >= 2 && pair && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <FeedCard icon="calendar" iconTone="brand" title={t('compare.pick')} testId="compare-pick">
            <div className="flex flex-wrap gap-3">
              <ScanPicker
                label={t('compare.from')}
                scans={newestFirst}
                value={pair.from}
                onChange={(from) => setPicked({ ...pair, from })}
                testId="compare-from"
              />
              <ScanPicker
                label={t('compare.to')}
                scans={newestFirst}
                value={pair.to}
                onChange={(to) => setPicked({ ...pair, to })}
                testId="compare-to"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setPicked({ from: previousId!, to: latestId! })}
                aria-pressed={pair.from === previousId && pair.to === latestId}
                data-testid="compare-last-shortcut"
              >
                {t('compare.last')}
              </Button>
              {newestFirst.length > 2 && (
                <Button
                  variant="secondary"
                  onClick={() => setPicked({ from: firstId!, to: latestId! })}
                  aria-pressed={pair.from === firstId && pair.to === latestId}
                  data-testid="compare-first-shortcut"
                >
                  {t('compare.first')}
                </Button>
              )}
            </div>
            {!valid && (
              <p className="m-0 text-label text-attention" role="status">
                {t('compare.sameScan')}
              </p>
            )}
          </FeedCard>
          {valid && change.status === 'ready' && (
            <Comparison change={change.data} title={t('tabs.compare')} testId="compare-result" />
          )}
          {valid && change.status === 'loading' && (
            <div className="lu-skeleton-card min-h-[240px] rounded-[20px]" aria-busy="true" />
          )}
        </div>
      )}
    </TabPage>
  );
};

export default Compare;
