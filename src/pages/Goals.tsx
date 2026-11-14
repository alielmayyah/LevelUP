import { IonIcon } from '@ionic/react';
import { arrowForward, chatbubbleEllipsesOutline, checkmarkCircle, chevronDown, flagOutline } from 'ionicons/icons';
import { useId, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import type { GoalMetric, GoalsDto, GoalView } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import TabPage from '../components/TabPage';
import { formatNumber, formatPercent, numberLocale } from '../i18n/format';
import './goals/Goals.scss';

const LIST = 'm-0 grid list-none gap-3 p-0 md:grid-cols-[1fr_1fr] md:items-start';

type GoalTab = 'active' | 'completed' | 'upcoming';
/** Section order: what the member is working on, what comes next, then what is done. */
const SECTIONS: GoalTab[] = ['active', 'upcoming', 'completed'];

/** Each goal metric gets the same icon and hue it has on Home and Progress. */
const METRIC: Record<GoalMetric, { icon: PixelIconName; tone: string }> = {
  BODY_FAT_KG: { icon: 'flame', tone: 'fat' },
  MUSCLE_KG: { icon: 'muscle', tone: 'muscle' },
  WEIGHT_KG: { icon: 'scale', tone: 'weight' },
};

const RANGE_END =
  'grid gap-0.5 rounded-lg border-2 border-line bg-surface-2 px-2.5 py-2 font-extrabold whitespace-nowrap';
const RANGE_LABEL = 'text-[0.75rem] font-bold text-muted';

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

/**
 * One goal as a compact row: icon, title, "60% · 3.0 / 5.0 kg", and a bar.
 * Tapping it opens the details (start → target, due date, coach note).
 */
const GoalRow: React.FC<{ goal: GoalView; kind: GoalTab; now: number }> = ({ goal, kind, now }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const kg = t('units.kg');
  const { icon, tone } = METRIC[goal.metric];
  const percent = Math.min(100, Math.max(0, goal.percent));
  const total = Math.abs(goal.targetValue - goal.startValue);
  const done = (total * percent) / 100;
  const overdue = kind === 'active' && new Date(goal.deadline).getTime() < now;

  const meta =
    kind === 'completed' && goal.completedAt
      ? t('goals.completedOn', { date: shortDate(goal.completedAt) })
      : kind === 'upcoming'
        ? t('goals.upcomingNote')
        : `${formatPercent(percent)} · ${formatNumber(done, 1)} / ${formatNumber(total, 1)} ${kg}`;

  return (
    <li className={`lu-px-card lu-goal grid gap-2.5 p-3 lu-goal-${tone} lu-goal-${kind}`} data-testid="goal">
      <button
        type="button"
        className="lu-goal-row flex min-h-12 w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-start font-inherit text-ink focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className="lu-goal-icon grid size-12 flex-none place-items-center rounded-lg text-[32px]"
          aria-hidden="true"
        >
          <PixelIcon name={icon} />
        </span>
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="text-[1.05rem] leading-[1.25] font-extrabold">{goal.title}</span>
          <span
            className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] font-bold ${kind === 'completed' ? 'text-success' : 'text-muted'}`}
            data-testid="goal-meta"
          >
            {kind === 'completed' && <IonIcon className="text-[1.05rem]" icon={checkmarkCircle} aria-hidden="true" />}
            {meta}
            {overdue && <span className="lu-chip lu-chip-danger">{t('goals.overdue')}</span>}
          </span>
        </span>
        <IonIcon
          className="lu-goal-chevron flex-none text-[1.15rem] text-muted"
          icon={chevronDown}
          aria-hidden="true"
        />
      </button>

      {/* Completed goals keep a full bar, so the member sees what they've already achieved. */}
      {kind !== 'upcoming' && (
        <div
          className="lu-bar lu-goal-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={goal.title}
        >
          <span style={{ '--lu-bar': `${percent}%` } as CSSProperties} />
        </div>
      )}

      <div
        id={detailsId}
        className="grid gap-2.5 pt-2.5 [border-block-start:2px_dashed_var(--lu-border)] [&[hidden]]:hidden"
        hidden={!open}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <span className={RANGE_END}>
            <small className={RANGE_LABEL}>{t('goals.start')}</small>
            {formatNumber(goal.startValue, 1)} {kg}
          </span>
          {/* Points from start to target in the reading direction. */}
          <IonIcon className="text-[1.2rem] text-muted rtl:-scale-x-100" icon={arrowForward} aria-hidden="true" />
          <span className={RANGE_END}>
            <small className={RANGE_LABEL}>{t('goals.target')}</small>
            {formatNumber(goal.targetValue, 1)} {kg}
          </span>
        </div>
        {kind !== 'completed' && (
          <p className="m-0 text-[0.875rem] font-bold text-muted">
            {t('goals.due', { date: shortDate(goal.deadline) })}
          </p>
        )}
        {goal.coachNote && (
          <p className="m-0 flex items-start gap-2.5 rounded-lg border-2 border-line bg-surface-2 px-3 py-2.5 text-[0.9rem] font-semibold">
            <IonIcon
              className="mt-0.5 flex-none text-[1.1rem] text-primary dark:text-secondary"
              icon={chatbubbleEllipsesOutline}
              aria-hidden="true"
            />
            {goal.coachNote}
          </p>
        )}
      </div>
    </li>
  );
};

/** Goals tab: every goal on one page, in progress first, then up next, then completed. */
const Goals: React.FC = () => {
  const { t } = useTranslation();
  const goals = useApi<GoalsDto>('/me/goals');
  const [now] = useState(() => Date.now());
  useRefreshOnEnter(goals.reload);

  const data = goals.status === 'ready' ? goals.data : null;
  const total = data ? data.active.length + data.upcoming.length + data.completed.length : 0;

  return (
    <TabPage
      testId="page-goals"
      title={t('tabs.goals')}
      titleIcon={<PixelIcon className="lu-title-icon flex-none text-[0.75em]" name="flag" />}
      subtitle={t('goals.subtitle')}
      onRefresh={goals.reload}
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
        <div className="lu-px-card lu-state" data-testid="goals-empty">
          <IonIcon icon={flagOutline} aria-hidden="true" />
          <p>{t('goals.empty')}</p>
        </div>
      )}

      {data && total > 0 && (
        <div className="grid gap-[18px]">
          {SECTIONS.map((kind) =>
            data[kind].length === 0 ? null : (
              <section key={kind} aria-labelledby={`goals-${kind}`} data-testid={`section-${kind}`}>
                <h2 id={`goals-${kind}`} className="lu-section-title mt-0">
                  {t(`goals.section.${kind}`)}{' '}
                  <span className="box-border inline-grid h-[22px] min-w-[22px] place-items-center rounded-md bg-surface-2 px-[5px] text-[0.78rem] text-muted">
                    {formatNumber(data[kind].length)}
                  </span>
                </h2>
                <ul className={LIST}>
                  {data[kind].map((g) => (
                    <GoalRow key={g.id} goal={g} kind={kind} now={now} />
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
    </TabPage>
  );
};

export default Goals;
