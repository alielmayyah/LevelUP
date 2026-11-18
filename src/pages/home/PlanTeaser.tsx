import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { Advice } from '../../api/types';
import { ADVICE_ICON, adviceText, LEVEL_DISC } from '../../body/planText';
import Icon from '../../components/Icon';

/**
 * "What to do next" on Home: the top item of the member's plan, which comes
 * with the dashboard (so Home makes no extra request and it shows on first
 * open), and a way to the full plan on Progress.
 */
const PlanTeaser: React.FC<{ top: Advice }> = ({ top }) => {
  const { t } = useTranslation();
  const text = adviceText(t, top);

  return (
    <section aria-labelledby="plan-home-title">
      <Link to="/tabs/progress" className="lu-card grid gap-3 text-start no-underline" data-testid="plan-teaser">
        <span className="flex items-center gap-3">
          <span
            className="lu-plan-badge grid size-10 flex-none place-items-center rounded-2xl text-[1.15rem]"
            aria-hidden="true"
          >
            <Icon name="target" />
          </span>
          <h2 id="plan-home-title" className="lu-card-title m-0 flex-1 text-[1.05rem] text-ink">
            {t('plan.homeTitle')}
          </h2>
          <Icon className="lu-chevron" name="chevronForward" />
        </span>
        <span className="grid gap-2">
          <span className="flex items-start gap-3" data-testid="plan-teaser-top" data-level={top.level}>
            <span className={`lu-disc ${LEVEL_DISC[top.level]} size-9 text-[1.05rem]`} aria-hidden="true" data-pop>
              <Icon name={ADVICE_ICON[top.metric]} />
            </span>
            <span className="grid min-w-0 gap-1">
              <span className={`lu-plan-level lu-plan-${top.level} w-fit rounded-full px-2 py-0.5`}>
                {t(`plan.level.${top.level}`)}
              </span>
              <strong className="font-display text-[1rem] leading-snug font-semibold text-ink">{text.title}</strong>
              <span className="text-[0.85rem] leading-snug text-muted">{text.why}</span>
            </span>
          </span>
          <span className="font-display text-[0.9rem] font-semibold text-primary dark:text-secondary">
            {t('plan.homeOpen')}
          </span>
        </span>
      </Link>
    </section>
  );
};

export default PlanTeaser;
