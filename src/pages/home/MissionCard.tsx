import { IonIcon } from '@ionic/react';
import { calendarOutline, chevronForward, flagOutline } from 'ionicons/icons';
import { useId, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import type { MissionSummary } from '../../api/types';
import PixelIcon from '../../components/PixelIcon';
import { formatNumber, formatPercent, numberLocale } from '../../i18n/format';

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric' }).format(new Date(iso));

/** The active goal with a progress ring. Opens the Goals tab. */
const MissionCard: React.FC<{ mission: MissionSummary | null }> = ({ mission }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const ids = useId();
  const headingId = `${ids}-h`;

  const head = (
    <span className="lu-card-head">
      <span className="lu-card-kicker">
        <IonIcon icon={flagOutline} aria-hidden="true" />
        {t('home.mission.title')}
      </span>
      {mission && <IonIcon className="lu-chevron" icon={chevronForward} aria-hidden="true" />}
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
            <span id={`${ids}-details`} className="grid gap-0.5">
              <span>
                {t('home.mission.progress', {
                  done: formatNumber(mission.doneKg, 1),
                  total: formatNumber(mission.doneKg + mission.remainingKg, 1),
                })}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[0.875rem] text-muted">
                <IonIcon className="flex-none text-[1rem]" icon={calendarOutline} aria-hidden="true" />
                {mission.estimatedCompletion
                  ? t('home.mission.eta', { date: formatDay(mission.estimatedCompletion) })
                  : t('home.mission.noEta')}
              </span>
            </span>
          </span>
        </span>
        {/* A gym-floor strip with a dumbbell, along the card's bottom edge. Decorative. */}
        <span className="lu-mission-ground" aria-hidden="true">
          <span className="lu-mission-dumbbell">
            <PixelIcon name="dumbbell" />
          </span>
        </span>
      </button>
    </section>
  );
};

export default MissionCard;
