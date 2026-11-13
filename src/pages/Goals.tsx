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
import './goals/Goals.css';

type GoalTab = 'active' | 'completed' | 'upcoming';
/** Section order: what the member is working on, what comes next, then what is done. */
const SECTIONS: GoalTab[] = ['active', 'upcoming', 'completed'];

/** Each goal metric gets the same icon and hue it has on Home and Progress. */
const METRIC: Record<GoalMetric, { icon: PixelIconName; tone: string }> = {
  BODY_FAT_KG: { icon: 'flame', tone: 'fat' },
  MUSCLE_KG: { icon: 'muscle', tone: 'muscle' },
  WEIGHT_KG: { icon: 'scale', tone: 'weight' },
};

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
    <li className={`lu-px-card lu-goal lu-goal-${tone} lu-goal-${kind}`} data-testid="goal">
      <button
        type="button"
        className="lu-goal-row"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="lu-goal-icon" aria-hidden="true">
          <PixelIcon name={icon} />
        </span>
        <span className="lu-goal-main">
          <span className="lu-goal-title">{goal.title}</span>
          <span className="lu-goal-meta" data-testid="goal-meta">
            {kind === 'completed' && <IonIcon icon={checkmarkCircle} aria-hidden="true" />}
            {meta}
            {overdue && <span className="lu-chip lu-chip-danger">{t('goals.overdue')}</span>}
          </span>
        </span>
        <IonIcon className="lu-goal-chevron" icon={chevronDown} aria-hidden="true" />
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

      <div id={detailsId} className="lu-goal-details" hidden={!open}>
        <div className="lu-goal-range">
          <span>
            <small>{t('goals.start')}</small>
            {formatNumber(goal.startValue, 1)} {kg}
          </span>
          {/* Points from start to target in the reading direction. */}
          <IonIcon className="lu-goal-arrow" icon={arrowForward} aria-hidden="true" />
          <span>
            <small>{t('goals.target')}</small>
            {formatNumber(goal.targetValue, 1)} {kg}
          </span>
        </div>
        {kind !== 'completed' && <p className="lu-goal-due">{t('goals.due', { date: shortDate(goal.deadline) })}</p>}
        {goal.coachNote && (
          <p className="lu-goal-note">
            <IonIcon icon={chatbubbleEllipsesOutline} aria-hidden="true" />
            {goal.coachNote}
          </p>
        )}
      </div>
    </li>
  );
};

/**
 * The whole journey at a glance: "2/4 goals done", and one pixel block per goal
 * in order, filled when done, partly filled for the one in progress, empty for
 * what's next.
 */
const Journey: React.FC<{ goals: GoalsDto }> = ({ goals }) => {
  const { t } = useTranslation();
  const done = goals.completed.length;
  const total = done + goals.active.length + goals.upcoming.length;
  const blocks = [
    ...goals.completed.map((g) => ({ id: g.id, kind: 'completed' as const, percent: 100 })),
    ...goals.active.map((g) => ({ id: g.id, kind: 'active' as const, percent: Math.min(100, Math.max(0, g.percent)) })),
    ...goals.upcoming.map((g) => ({ id: g.id, kind: 'upcoming' as const, percent: 0 })),
  ];
  return (
    <section className="lu-px-card lu-journey" data-testid="journey" aria-labelledby="journey-title">
      <div className="lu-journey-head">
        <h2 id="journey-title" className="lu-card-title">
          {t('goals.journey')}
        </h2>
        <p className="lu-journey-count">
          {/* "2/4" is a fraction, so it stays left-to-right in Arabic too. */}
          <strong className="lu-display" dir="ltr">
            {formatNumber(done)}/{formatNumber(total)}
          </strong>{' '}
          {t('goals.done')}
        </p>
      </div>
      <ol className="lu-journey-track" aria-hidden="true">
        {blocks.map((b) => (
          <li
            key={b.id}
            className={`lu-journey-step is-${b.kind}`}
            style={{ '--lu-step': `${b.percent}%` } as CSSProperties}
          />
        ))}
      </ol>
    </section>
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
    <TabPage testId="page-goals" title={t('tabs.goals')} subtitle={t('goals.subtitle')} onRefresh={goals.reload}>
      {goals.status === 'loading' && (
        <div className="lu-goal-list" aria-busy="true">
          <div className="lu-skeleton-card lu-skeleton-goal" />
          <div className="lu-skeleton-card lu-skeleton-goal" />
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
        <div className="lu-goals">
          <Journey goals={data} />
          {SECTIONS.map((kind) =>
            data[kind].length === 0 ? null : (
              <section
                key={kind}
                className="lu-goal-section"
                aria-labelledby={`goals-${kind}`}
                data-testid={`section-${kind}`}
              >
                <h2 id={`goals-${kind}`} className="lu-section-title">
                  {t(`goals.section.${kind}`)}{' '}
                  <span className="lu-section-count">{formatNumber(data[kind].length)}</span>
                </h2>
                <ul className="lu-goal-list">
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
