import { IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { add, arrowBack, checkmark, remove } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createGoal } from '../api/goals';
import type { AssessmentDto, GoalMetric, GoalsDto } from '../api/types';
import { useApi } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import PixelToast from '../components/PixelToast';
import { focusSibling, rovingTarget } from '../components/roving';
import { formatNumber, formatSigned, numberLocale } from '../i18n/format';
import './goals/Goals.scss';

const STEP = 0.5;
const METRICS: readonly GoalMetric[] = ['BODY_FAT_KG', 'MUSCLE_KG', 'WEIGHT_KG'];
const MONTHS = [1, 2, 3, 6] as const;
type Months = (typeof MONTHS)[number];

/** Same icon and hue as the goal rows, Home, and Progress. */
const LOOK: Record<GoalMetric, { icon: PixelIconName; tone: string }> = {
  BODY_FAT_KG: { icon: 'flame', tone: 'fat' },
  MUSCLE_KG: { icon: 'muscle', tone: 'muscle' },
  WEIGHT_KG: { icon: 'scale', tone: 'weight' },
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const onGrid = (n: number) => Math.round(n / STEP) * STEP;

const current = (scan: AssessmentDto, metric: GoalMetric) =>
  metric === 'BODY_FAT_KG' ? scan.bodyFatKg : metric === 'MUSCLE_KG' ? scan.skeletalMuscleKg : scan.weightKg;

/**
 * What the stepper moves. Fat and muscle goals pick an amount to lose or gain
 * (0.5 kg steps); a weight goal picks the target weight itself, either way.
 */
function range(metric: GoalMetric, now: number) {
  switch (metric) {
    case 'BODY_FAT_KG':
      return { min: STEP, max: Math.min(15, Math.max(STEP, Math.floor((now * 0.6) / STEP) * STEP)), start: 2 };
    case 'MUSCLE_KG':
      return { min: STEP, max: 10, start: 2 };
    case 'WEIGHT_KG':
      return { min: Math.max(30, onGrid(now - 30)), max: onGrid(now + 30), start: onGrid(now - 2) };
  }
}

const targetFor = (metric: GoalMetric, now: number, value: number) =>
  round1(metric === 'BODY_FAT_KG' ? now - value : metric === 'MUSCLE_KG' ? now + value : value);

const dueDate = (from: number, months: Months) => {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
};

const longDate = (d: Date) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(d);

interface ChoiceProps<T> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelledBy: string;
  className: string;
  render: (v: T, on: boolean) => React.ReactNode;
  optionClass: (v: T) => string;
  testId: (v: T) => string;
}

/** A radio group with one Tab stop and arrow keys, as in the character editor. */
function Choice<T extends string | number>({
  options,
  value,
  onChange,
  labelledBy,
  className,
  render,
  optionClass,
  testId,
}: ChoiceProps<T>) {
  const { i18n } = useTranslation();
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={className}>
      {options.map((o, i) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className={optionClass(o)}
            onClick={() => onChange(o)}
            onKeyDown={(e) => {
              const to = rovingTarget(e, i, options.length, i18n.dir() === 'rtl');
              if (to === null) return;
              onChange(options[to]);
              focusSibling(e, to);
            }}
            data-testid={testId(o)}
          >
            {render(o, on)}
          </button>
        );
      })}
    </div>
  );
}

const SECTION = 'lu-px-card grid gap-3 p-3.5';
const QUESTION = 'm-0 text-[1rem] font-extrabold text-ink';

/**
 * The member sets their own goal: what to change, by how much, and by when.
 * It goes live at once, or queues after the current mission. No coach approval.
 */
const NewGoal: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const scans = useApi<AssessmentDto[]>('/me/assessments');
  const goals = useApi<GoalsDto>('/me/goals');
  const [now] = useState(() => Date.now());

  const [metric, setMetric] = useState<GoalMetric>('BODY_FAT_KG');
  /** The stepper value per metric, once the member has moved it. */
  const [picked, setPicked] = useState<Partial<Record<GoalMetric, number>>>({});
  const [months, setMonths] = useState<Months>(3);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const clearFailed = useCallback(() => setFailed(false), []);

  const leave = useCallback(() => {
    if (router.canGoBack()) router.goBack();
    else router.push('/tabs/goals', 'back', 'replace');
  }, [router]);

  const scan = scans.status === 'ready' ? (scans.data[0] ?? null) : null;
  const queued = goals.status === 'ready' && goals.data.active.length > 0;

  const header = (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        className="lu-icon-button"
        onClick={leave}
        aria-label={t('newGoal.back')}
        data-testid="new-goal-back"
      >
        <IonIcon className="rtl:-scale-x-100" icon={arrowBack} aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="lu-display m-0 text-[clamp(2rem,9vw,2.75rem)] leading-[1.05] wrap-anywhere text-ink">
          {t('newGoal.title')}
        </h1>
        <p className="mx-0 mt-1 mb-0 text-[0.9rem] text-muted">{t('newGoal.subtitle')}</p>
      </div>
    </div>
  );

  let body: React.ReactNode;
  if (scans.status === 'loading') body = <div className="lu-skeleton-card min-h-60" aria-busy="true" />;
  else if (scans.status === 'error')
    body = (
      <div className="lu-state" role="alert">
        <p>{t('newGoal.error')}</p>
        <CtaButton onClick={() => void scans.retry()}>{t('common.retry')}</CtaButton>
      </div>
    );
  else if (!scan)
    body = (
      <div className="lu-px-card lu-state" data-testid="new-goal-no-scan">
        <PixelIcon name="scale" />
        <p>{t('newGoal.noScan')}</p>
        <CtaButton onClick={leave}>{t('newGoal.back')}</CtaButton>
      </div>
    );
  else {
    const base = current(scan, metric);
    const r = range(metric, base);
    const value = Math.min(r.max, Math.max(r.min, picked[metric] ?? r.start));
    const target = targetFor(metric, base, value);
    const change = round1(target - base);
    const step = (dir: 1 | -1) => {
      let next = round1(value + dir * STEP);
      // A weight goal can't be the weight you are now.
      if (metric === 'WEIGHT_KG' && Math.abs(next - base) < 0.05) next = round1(next + dir * STEP);
      if (next >= r.min && next <= r.max) setPicked((p) => ({ ...p, [metric]: next }));
    };
    const due = dueDate(now, months);
    const amount = metric === 'WEIGHT_KG' ? target : Math.abs(change);
    const { icon, tone } = LOOK[metric];

    const submit = async () => {
      if (saving) return;
      setSaving(true);
      try {
        await createGoal({ metric, targetValue: target, deadline: due.toISOString() });
        leave();
      } catch {
        setFailed(true);
      } finally {
        setSaving(false);
      }
    };

    body = (
      <div className="mx-auto grid w-full max-w-180 gap-3.5">
        <section className={SECTION} aria-labelledby="new-goal-type">
          <h2 id="new-goal-type" className={QUESTION}>
            {t('newGoal.type')}
          </h2>
          <Choice
            options={METRICS}
            value={metric}
            onChange={setMetric}
            labelledBy="new-goal-type"
            className="grid gap-2 sm:grid-cols-3"
            optionClass={(m) =>
              `lu-goal-choice lu-goal-${LOOK[m].tone} flex min-h-14 cursor-pointer items-center gap-3 rounded-[10px] border-2 border-line bg-surface p-2.5 text-start font-inherit text-ink sm:grid sm:justify-items-center sm:text-center`
            }
            testId={(m) => `goal-type-${m}`}
            render={(m, on) => (
              <>
                <span
                  className="lu-goal-icon grid size-11 flex-none place-items-center rounded-lg text-[28px]"
                  aria-hidden="true"
                >
                  <PixelIcon name={LOOK[m].icon} />
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="leading-tight font-extrabold">{t(`newGoal.metric.${m}`)}</span>
                  <span className="text-[0.8rem] font-bold text-muted">
                    {t('newGoal.now', { value: formatNumber(current(scan, m), 1) })}
                  </span>
                </span>
                {on && (
                  <IonIcon
                    className="flex-none text-[1.2rem] text-primary sm:hidden dark:text-secondary"
                    icon={checkmark}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          />
        </section>

        <section className={SECTION} aria-labelledby="new-goal-amount">
          <h2 id="new-goal-amount" className={QUESTION}>
            {t(`newGoal.amount.${metric}`)}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              className="lu-icon-button size-12"
              onClick={() => step(-1)}
              disabled={value - STEP < r.min - 0.01}
              aria-label={t('newGoal.less')}
              data-testid="goal-less"
            >
              <IonIcon icon={remove} aria-hidden="true" />
            </button>
            <output
              className="lu-display min-w-[5ch] text-center text-[3rem] leading-none text-ink"
              aria-live="polite"
              data-testid="goal-amount"
            >
              {formatNumber(amount, 1)}
              <span className="ms-1.5 text-[1.25rem] text-muted">{t('units.kg')}</span>
            </output>
            <button
              type="button"
              className="lu-icon-button size-12"
              onClick={() => step(1)}
              disabled={value + STEP > r.max + 0.01}
              aria-label={t('newGoal.more')}
              data-testid="goal-more"
            >
              <IonIcon icon={add} aria-hidden="true" />
            </button>
          </div>
          <p className="m-0 text-center text-[0.875rem] font-bold text-muted" data-testid="goal-change">
            {t('newGoal.fromScan', { change: formatSigned(change) })}
          </p>
        </section>

        <section className={SECTION} aria-labelledby="new-goal-deadline">
          <h2 id="new-goal-deadline" className={QUESTION}>
            {t('newGoal.deadline')}
          </h2>
          <Choice
            options={MONTHS}
            value={months}
            onChange={setMonths}
            labelledBy="new-goal-deadline"
            className="lu-segment m-0"
            optionClass={() => ''}
            testId={(m) => `goal-months-${m}`}
            render={(m) => t(`newGoal.months.${m}`)}
          />
        </section>

        <section
          className={`lu-px-card lu-goal-${tone} grid gap-2 p-3.5`}
          aria-labelledby="new-goal-summary"
          data-testid="goal-summary"
        >
          <h2 id="new-goal-summary" className="m-0 text-[0.8rem] font-bold text-muted">
            {t('newGoal.summary')}
          </h2>
          <div className="flex items-center gap-3">
            <span
              className="lu-goal-icon grid size-12 flex-none place-items-center rounded-lg text-[32px]"
              aria-hidden="true"
            >
              <PixelIcon name={icon} />
            </span>
            <span className="grid min-w-0 gap-0.5">
              <span className="text-[1.1rem] leading-tight font-extrabold text-ink" data-testid="goal-name">
                {t(`newGoal.name.${metric}`, { amount: formatNumber(amount) })}
              </span>
              <span className="text-[0.875rem] font-bold text-muted">{t('goals.due', { date: longDate(due) })}</span>
            </span>
          </div>
          {goals.status === 'ready' && (
            <p className="m-0 text-[0.875rem] font-semibold text-muted" data-testid="goal-starts">
              {queued ? t('newGoal.startsNext') : t('newGoal.startsNow')}
            </p>
          )}
        </section>

        <CtaButton
          className="w-full"
          onClick={() => void submit()}
          disabled={saving}
          aria-busy={saving}
          data-testid="goal-create"
        >
          {saving ? t('newGoal.creating') : t('newGoal.create')}
        </CtaButton>
      </div>
    );
  }

  return (
    <IonPage data-testid="page-new-goal">
      <IonContent>
        <div className="lu-page-body lu-tab-body">
          {header}
          {body}
        </div>
      </IonContent>
      <PixelToast message={failed ? t('newGoal.failed') : null} onDone={clearFailed} />
    </IonPage>
  );
};

export default NewGoal;
