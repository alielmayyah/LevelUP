import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Advice } from '../../body/advice';
import { ADVICE_ICON, adviceText, LEVEL_DISC } from '../../body/planText';
import Icon from '../../components/Icon';
import { formatNumber } from '../../i18n/format';
import type { Insight } from './insight';

/** How many items show before "Show more". */
const FIRST = 3;

interface Props {
  advice: Advice[];
  /** What the change since the compared scan adds up to; null for a first scan or no comparison. */
  insight: Insight | null;
  /** The scan the plan is read from, already formatted. */
  scanDate: string;
}

/**
 * "Your plan": what to do next, most important first, each with why (the
 * member's own number) and how. Opens with what the last change adds up to,
 * when there is one. The single place on Progress that says what to do.
 */
const ActionPlan: React.FC<Props> = ({ advice, insight, scanDate }) => {
  const { t } = useTranslation();
  const [all, setAll] = useState(false);
  if (!advice.length) return null;
  const shown = all ? advice : advice.slice(0, FIRST);
  const hidden = advice.length - FIRST;
  const kg = (n: number) => `${formatNumber(Math.abs(n), 1)} ${t('units.kg')}`;
  const change = insight && `progress.insight.kind.${insight.kind}`;

  return (
    <section className="lu-card grid gap-4" aria-labelledby="plan-title" data-testid="action-plan">
      <header className="flex items-center gap-3">
        <span
          className="lu-plan-badge grid size-11 flex-none place-items-center rounded-2xl text-[1.25rem]"
          aria-hidden="true"
        >
          <Icon name="target" />
        </span>
        <div className="grid min-w-0">
          <h2 id="plan-title" className="lu-display m-0 text-[1.35rem] leading-tight text-ink">
            {t('plan.title')}
          </h2>
          <p className="m-0 text-[0.8125rem] text-muted">{t('plan.basedOn', { date: scanDate })}</p>
        </div>
      </header>

      {insight && change && (
        <div
          className="grid gap-1 rounded-[18px] bg-surface-2 p-3.5"
          data-testid="scan-insight"
          data-kind={insight.kind}
        >
          <p
            className="m-0 font-display text-[1rem] leading-snug font-semibold text-ink"
            data-testid="insight-headline"
          >
            {t(`${change}.title`)}
          </p>
          <p className="m-0 text-[0.875rem] leading-relaxed text-muted" data-testid="insight-body">
            {t(`${change}.body`, { muscle: kg(insight.muscleKg), fat: kg(insight.fatKg) })}
          </p>
        </div>
      )}

      <ol className="m-0 grid list-none gap-3 p-0" data-stagger>
        {shown.map((a, i) => {
          const text = adviceText(t, a);
          return (
            <li
              key={a.key}
              className={`lu-plan-item grid gap-2 ${i > 0 ? 'border-t border-line pt-3' : ''}`}
              data-testid={`advice-${a.key}`}
              data-level={a.level}
            >
              <div className="flex items-start gap-3">
                <span className={`lu-disc ${LEVEL_DISC[a.level]} size-10 text-[1.15rem]`} aria-hidden="true" data-pop>
                  <Icon name={ADVICE_ICON[a.metric]} />
                </span>
                <div className="grid min-w-0 flex-1 gap-1">
                  <span className={`lu-plan-level lu-plan-${a.level} w-fit rounded-full px-2 py-0.5`}>
                    {t(`plan.level.${a.level}`)}
                  </span>
                  <h3 className="m-0 font-display text-[1.05rem] leading-snug font-semibold text-ink">{text.title}</h3>
                  <p className="m-0 text-[0.875rem] leading-relaxed text-muted">{text.why}</p>
                </div>
              </div>
              <p className="m-0 flex items-start gap-2 rounded-[16px] bg-surface-2 p-3 text-[0.875rem] leading-snug text-ink">
                <Icon className="mt-0.5 flex-none text-[1.05rem] [--icon-color:var(--lu-gold)]" name="bulb" />
                <span>
                  <strong className="font-semibold">{t('plan.how')}</strong> {text.how}
                </span>
              </p>
            </li>
          );
        })}
      </ol>

      {hidden > 0 && (
        <button
          type="button"
          className="lu-link-button justify-self-center"
          aria-expanded={all}
          onClick={() => setAll((v) => !v)}
          data-testid="plan-more"
        >
          {all ? t('plan.less') : t('plan.more', { n: formatNumber(hidden) })}
        </button>
      )}
    </section>
  );
};

export default ActionPlan;
