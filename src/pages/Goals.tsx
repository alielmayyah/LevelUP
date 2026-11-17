import { useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import type { GoalMetric, GoalsDto, GoalView } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import Icon, { type IconName } from '../components/Icon';
import TabPage from '../components/TabPage';
import Toast from '../components/Toast';
import { formatNumber, formatPercent } from '../i18n/format';
import { goalJustCreated, takeGoalCreated } from './goals/created';
import './goals/Goals.scss';

const LIST = 'm-0 grid list-none gap-3 p-0 md:grid-cols-[1fr_1fr] md:items-start';

type GoalTab = 'active' | 'completed';
/** Section order: what the member is working on, then what is done. There is no time factor, so nothing waits in line. */
const SECTIONS: GoalTab[] = ['active', 'completed'];

/** Each goal metric gets the same icon and hue it has on Home and Progress. */
const METRIC: Record<GoalMetric, { icon: IconName; tone: string }> = {
  BODY_FAT_KG: { icon: 'bodyFat', tone: 'fat' },
  MUSCLE_KG: { icon: 'muscle', tone: 'muscle' },
  WEIGHT_KG: { icon: 'scale', tone: 'weight' },
};

/**
 * One goal, everything on the card, nothing to open: what it is, how far
 * along, and start → now → target. No dates: a scan's date is when the member
 * was measured, not when the goal was met, and member goals have no due date.
 */
const GoalCard: React.FC<{ goal: GoalView; kind: GoalTab }> = ({ goal, kind }) => {
  const { t } = useTranslation();
  const kg = t('units.kg');
  const { icon, tone } = METRIC[goal.metric];
  const percent = Math.min(100, Math.max(0, goal.percent));
  const total = Math.abs(goal.targetValue - goal.startValue);
  const done = (total * percent) / 100;
  const amount = (n: number) => `${formatNumber(n, 1)} ${kg}`;

  const status =
    kind === 'completed'
      ? t('goals.reached')
      : t('goals.doneOf', { done: formatNumber(done, 1), total: formatNumber(total, 1) });

  return (
    <li className={`lu-card lu-goal grid gap-3 lu-goal-${tone} lu-goal-${kind}`} data-testid="goal">
      <div className="flex items-center gap-3">
        <span
          className="lu-goal-icon grid size-12 flex-none place-items-center rounded-xl text-[26px]"
          aria-hidden="true"
        >
          <Icon name={icon} />
        </span>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h3 className="m-0 text-[1.05rem] leading-[1.25] font-semibold text-ink">{goal.title}</h3>
          <span
            className={`text-[0.85rem] ${kind === 'completed' ? 'font-semibold text-success' : 'font-normal text-muted'}`}
            data-testid="goal-meta"
          >
            {status}
          </span>
        </div>
        {kind === 'active' && (
          <span className="lu-display flex-none text-[2rem] leading-none text-ink" data-testid="goal-percent">
            {formatPercent(percent)}
          </span>
        )}
        {kind === 'completed' && (
          <span className="lu-goal-done grid size-9 flex-none place-items-center rounded-full" aria-hidden="true">
            <Icon className="text-[1.2rem]" name="check" />
          </span>
        )}
      </div>

      {/* One line: where the goal started, the bar, and the target at the end. */}
      <div className="flex items-center gap-2.5" data-testid="goal-stats">
        <span className="text-[0.85rem] font-normal whitespace-nowrap text-muted">
          <span className="sr-only">{t('goals.start')} </span>
          {amount(goal.startValue)}
        </span>
        <div
          className="lu-bar lu-goal-progress min-w-0 flex-1"
          style={{ '--lu-bar': `${percent}%` } as CSSProperties}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={goal.title}
        >
          <span />
        </div>
        <span className="lu-goal-target text-[0.85rem] font-semibold whitespace-nowrap">
          <span className="sr-only">{t('goals.target')} </span>
          {amount(goal.targetValue)}
        </span>
      </div>
    </li>
  );
};

/** Goals tab: every goal on one page, in progress first, then up next, then completed. */
const Goals: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const goals = useApi<GoalsDto>('/me/goals');
  const newGoal = () => router.push('/tabs/goals/new', 'forward');
  useRefreshOnEnter(goals.reload);

  // "Goal set!" once, when New goal sends the member back here: read on first
  // render if this page is new, or when Ionic shows the page again.
  const [created, setCreated] = useState(goalJustCreated);
  const clearCreated = useCallback(() => setCreated(false), []);
  useEffect(() => {
    takeGoalCreated();
  }, []);
  useIonViewWillEnter(() => {
    if (takeGoalCreated()) setCreated(true);
  }, []);

  const data = goals.status === 'ready' ? goals.data : null;
  const total = data ? data.active.length + data.completed.length : 0;

  return (
    <TabPage
      testId="page-goals"
      title={t('tabs.goals')}
      titleIcon={<Icon className="lu-title-icon flex-none text-[0.75em]" name="target" />}
      subtitle={t('goals.subtitle')}
      onRefresh={goals.reload}
      // One primary button per screen: with no goals, the empty state's button is the one.
      actions={
        total > 0 ? (
          <CtaButton
            className="min-h-11 flex-none gap-1 px-4 py-2 text-[1rem]"
            onClick={newGoal}
            data-testid="goal-new"
          >
            <Icon className="text-[1.1rem]" name="add" />
            {t('goals.new')}
          </CtaButton>
        ) : undefined
      }
    >
      {goals.status === 'loading' && (
        <div className={LIST} aria-busy="true">
          <div className="lu-skeleton-card min-h-[92px]" />
          <div className="lu-skeleton-card min-h-[92px]" />
        </div>
      )}

      {goals.status === 'error' && (
        <div className="lu-state" role="alert">
          <p>{t('goals.error')}</p>
          <CtaButton onClick={() => void goals.retry()}>{t('common.retry')}</CtaButton>
        </div>
      )}

      {data && total === 0 && (
        <div className="lu-card lu-state" data-testid="goals-empty">
          <Icon name="target" />
          <p>{t('goals.empty')}</p>
          <CtaButton onClick={newGoal} data-testid="goal-new-empty">
            {t('goals.emptyCta')}
          </CtaButton>
        </div>
      )}

      {data && total > 0 && (
        <div className="grid gap-[18px]">
          {SECTIONS.map((kind) =>
            data[kind].length === 0 ? null : (
              <section key={kind} aria-labelledby={`goals-${kind}`} data-testid={`section-${kind}`}>
                <h2 id={`goals-${kind}`} className="lu-section-title mt-0">
                  {t(`goals.section.${kind}`)}{' '}
                  <span className="box-border inline-grid h-[22px] min-w-[22px] place-items-center rounded-full bg-surface-2 px-[7px] text-[0.78rem] font-normal text-muted">
                    {formatNumber(data[kind].length)}
                  </span>
                </h2>
                <ul className={LIST}>
                  {data[kind].map((g) => (
                    <GoalCard key={g.id} goal={g} kind={kind} />
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
      <Toast message={created ? t('goals.created') : null} onDone={clearCreated} />
    </TabPage>
  );
};

export default Goals;
