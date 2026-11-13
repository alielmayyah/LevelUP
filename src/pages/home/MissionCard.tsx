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
    <h2 id={headingId} className="lu-visually-hidden">
      {t('home.mission.title')}
    </h2>
  );

  if (!mission)
    return (
      <section className="lu-card-slot" aria-labelledby={headingId}>
        {heading}
        <div className="lu-px-card lu-mission" data-testid="mission-card">
          {head}
          <p className="lu-mission-empty">{t('home.mission.empty')}</p>
        </div>
      </section>
    );

  const percent = Math.min(100, Math.max(0, mission.percent));
  const ring = {
    '--lu-ring-full': CIRCUMFERENCE,
    '--lu-ring-offset': CIRCUMFERENCE * (1 - percent / 100),
  } as CSSProperties;

  return (
    <section className="lu-card-slot" aria-labelledby={headingId}>
      {heading}
      <button
        type="button"
        className="lu-px-card lu-mission"
        data-testid="mission-card"
        onClick={() => history.push('/tabs/goals')}
      >
        {head}
        <span className="lu-mission-body">
          <span className="lu-ring" aria-hidden="true">
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
            <span id={`${ids}-pct`} className="lu-ring-label">
              {formatPercent(percent)}
            </span>
          </span>
          <span className="lu-mission-text">
            <strong id={`${ids}-title`}>{mission.title}</strong>
            <span id={`${ids}-details`} className="lu-mission-details">
              <span>
                {t('home.mission.progress', {
                  done: formatNumber(mission.doneKg, 1),
                  total: formatNumber(mission.doneKg + mission.remainingKg, 1),
                })}
              </span>
              <span className="lu-mission-eta">
                <IonIcon icon={calendarOutline} aria-hidden="true" />
                {mission.estimatedCompletion
                  ? t('home.mission.eta', { date: formatDay(mission.estimatedCompletion) })
                  : t('home.mission.noEta')}
              </span>
            </span>
          </span>
        </span>
        {/* A grassy pixel ledge with a dumbbell, along the card's bottom edge. Decorative. */}
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
