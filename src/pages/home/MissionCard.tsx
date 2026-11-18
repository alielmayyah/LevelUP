import { useId, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import type { MissionSummary } from '../../api/types';
import Icon from '../../components/Icon';
import { formatNumber, formatPercent } from '../../i18n/format';

/** The active goal with a big percentage and a progress bar; opens the Goals tab. With no goal, it opens New goal. */
const MissionCard: React.FC<{ mission: MissionSummary | null }> = ({ mission }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const ids = useId();
  const headingId = `${ids}-h`;

  const head = (
    <span className="lu-card-head">
      <span className="lu-card-title">
        <Icon name="flag" />
        {t('home.mission.title')}
      </span>
      <Icon className="lu-chevron" name="chevronForward" />
    </span>
  );
  // A heading for heading navigation. The visible label stays in the button so its name matches what is shown (WCAG 2.5.3).
  const heading = (
    <h2 id={headingId} className="sr-only">
      {t('home.mission.title')}
    </h2>
  );

  // No goal yet: the whole card is the way to set one.
  if (!mission)
    return (
      <section className="grid" aria-labelledby={headingId}>
        {heading}
        <button
          type="button"
          className="lu-card grid gap-2.5"
          data-testid="mission-card"
          onClick={() => history.push('/tabs/goals/new')}
        >
          {head}
          <span className="flex items-center gap-2 font-semibold text-ink" data-testid="mission-empty">
            <Icon name="add" />
            {t('home.mission.empty')}
          </span>
        </button>
      </section>
    );

  const percent = Math.min(100, Math.max(0, mission.percent));
  const bar = { '--lu-bar': `${percent}%` } as CSSProperties;

  return (
    <section className="grid" aria-labelledby={headingId}>
      {heading}
      <button
        type="button"
        className="lu-card grid gap-3"
        data-testid="mission-card"
        onClick={() => history.push('/tabs/goals')}
      >
        {head}
        <span className="flex items-end justify-between gap-3">
          <strong
            id={`${ids}-title`}
            className="min-w-0 font-display text-[1.2rem] leading-[1.25] font-semibold text-ink"
          >
            {mission.title}
          </strong>
          <span
            id={`${ids}-pct`}
            className="lu-display flex-none text-[2.25rem] leading-[0.95] text-ink"
            data-testid="mission-percent"
          >
            {formatPercent(percent)}
          </span>
        </span>
        <span className="lu-bar block" style={bar} aria-hidden="true">
          <span data-grow />
        </span>
        <span id={`${ids}-details`} className="grid gap-1">
          {/* The bar and "kg to go" are drawn; the full done/total is read out as one sentence. */}
          <span className="sr-only">
            {t('home.mission.progress', {
              done: formatNumber(mission.doneKg, 1),
              total: formatNumber(mission.doneKg + mission.remainingKg, 1),
            })}
          </span>
          <span className="text-[0.9375rem] font-normal text-muted" data-testid="mission-left">
            {mission.remainingKg > 0
              ? t('home.mission.toGo', { left: formatNumber(mission.remainingKg, 1) })
              : t('home.mission.reached')}
          </span>
        </span>
      </button>
    </section>
  );
};

export default MissionCard;
