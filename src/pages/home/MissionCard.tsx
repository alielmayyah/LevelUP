import { useId, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import type { MissionSummary } from '../../api/types';
import HomeIcon from './HomeIcon';
import { formatNumber, formatPercent } from '../../i18n/format';

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** The pixel progress bar under the amount: one block per tenth of the goal. */
const BLOCKS = 10;

/** The active goal with a progress ring. Opens the Goals tab. */
const MissionCard: React.FC<{ mission: MissionSummary | null }> = ({ mission }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const ids = useId();
  const headingId = `${ids}-h`;

  const head = (
    <span className="lu-card-head">
      <span className="lu-card-kicker">
        <HomeIcon name="flag" />
        {t('home.mission.title')}
      </span>
      {mission && <HomeIcon className="lu-chevron" name="chevronForward" />}
    </span>
  );
  // A heading for heading navigation. The visible label stays in the button so its name matches what is shown (WCAG 2.5.3).
  const heading = (
    <h2 id={headingId} className="sr-only">
      {t('home.mission.title')}
    </h2>
  );

  if (!mission)
    return (
      <section className="grid" aria-labelledby={headingId}>
        {heading}
        <div className="lu-px-card relative grid gap-2.5 overflow-hidden pb-[30px]" data-testid="mission-card">
          {head}
          <p className="m-0 text-muted">{t('home.mission.empty')}</p>
        </div>
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
        className="lu-px-card relative grid gap-2.5 overflow-hidden pb-[30px]"
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
              className="absolute inset-0 grid place-items-center font-display text-[1.45rem] leading-none font-normal text-ink"
            >
              {formatPercent(percent)}
            </span>
          </span>
          <span className="grid min-w-0 gap-1 text-[0.95rem] font-semibold text-ink">
            <strong id={`${ids}-title`} className="text-[1.1rem] leading-[1.25] font-extrabold">
              {mission.title}
            </strong>
            <span id={`${ids}-details`} className="grid gap-1.5">
              {/* Read out as one sentence; drawn as a big number, a pixel bar, and what's left. */}
              <span className="sr-only">
                {t('home.mission.progress', {
                  done: formatNumber(mission.doneKg, 1),
                  total: formatNumber(mission.doneKg + mission.remainingKg, 1),
                })}
              </span>
              <span className="flex items-baseline gap-1.5" aria-hidden="true" data-testid="mission-amount">
                <strong className="lu-display text-[1.75rem] leading-none font-normal text-ink">
                  {formatNumber(mission.doneKg, 1)}
                </strong>
                <span className="text-[0.9rem] font-bold text-muted">
                  / {formatNumber(mission.doneKg + mission.remainingKg, 1)} {t('units.kg')}
                </span>
              </span>
              <span className="lu-mission-blocks flex gap-[3px]" aria-hidden="true">
                {Array.from({ length: BLOCKS }, (_, i) => (
                  <span key={i} className={i < Math.round((percent / 100) * BLOCKS) ? 'is-on' : undefined} />
                ))}
              </span>
              <span className="text-[0.8rem] font-bold text-muted" data-testid="mission-left">
                {mission.remainingKg > 0
                  ? t('home.mission.toGo', { left: formatNumber(mission.remainingKg, 1) })
                  : t('home.mission.reached')}
              </span>
            </span>
          </span>
        </span>
        {/* A gym-floor strip with a dumbbell, along the card's bottom edge. Decorative. */}
        <span className="lu-mission-ground" aria-hidden="true">
          <span className="lu-mission-dumbbell">
            <HomeIcon name="dumbbell" />
          </span>
        </span>
      </button>
    </section>
  );
};

export default MissionCard;
