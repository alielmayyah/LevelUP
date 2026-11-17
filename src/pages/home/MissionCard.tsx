import { useId, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import type { MissionSummary } from '../../api/types';
import Icon from '../../components/Icon';
import { formatNumber, formatPercent } from '../../i18n/format';

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The active goal with a progress ring; opens the Goals tab. With no goal, it opens New goal. */
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
  const ring = {
    '--lu-ring-full': CIRCUMFERENCE,
    '--lu-ring-offset': CIRCUMFERENCE * (1 - percent / 100),
  } as CSSProperties;

  return (
    <section className="grid" aria-labelledby={headingId}>
      {heading}
      <button
        type="button"
        className="lu-card grid gap-2.5"
        data-testid="mission-card"
        onClick={() => history.push('/tabs/goals')}
      >
        {head}
        <span className="flex items-center gap-3.5">
          <span className="lu-ring relative size-[76px] flex-none" aria-hidden="true">
            {/* Fills clockwise in English; the svg is mirrored in Arabic so it fills counter-clockwise. */}
            <svg viewBox="0 0 64 64">
              <circle className="lu-ring-track" cx="32" cy="32" r={RADIUS} />
              <circle
                className="lu-ring-fill"
                cx="32"
                cy="32"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                style={ring}
              />
            </svg>
            <span
              id={`${ids}-pct`}
              className="absolute inset-0 grid place-items-center font-display text-[1.3rem] leading-none font-bold text-ink tabular-nums"
            >
              {formatPercent(percent)}
            </span>
          </span>
          <span className="grid min-w-0 gap-1 text-ink">
            <strong id={`${ids}-title`} className="text-[1.125rem] leading-[1.25] font-semibold">
              {mission.title}
            </strong>
            <span id={`${ids}-details`} className="grid gap-1">
              {/* The ring and "kg to go" are drawn; the full done/total is read out as one sentence. */}
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
          </span>
        </span>
      </button>
    </section>
  );
};

export default MissionCard;
