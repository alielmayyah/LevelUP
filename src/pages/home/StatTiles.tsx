import { IonIcon } from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import type { MonthlyWins } from '../../api/types';
import PixelIcon, { type PixelIconName } from '../../components/PixelIcon';
import { formatSigned } from '../../i18n/format';
import { formatMonth, formatMonthYear } from './homeText';

type Tone = 'good' | 'bad' | 'none';

/** Fat going down is good; muscle going up is good. */
const tone = (value: number | null, goodWhen: 'down' | 'up'): Tone => {
  if (value === null || value === 0) return 'none';
  return value < 0 === (goodWhen === 'down') ? 'good' : 'bad';
};

interface TileProps {
  metric: 'fat' | 'muscle' | 'since';
  icon: PixelIconName;
  label: string;
  value: string;
  tone?: Tone;
  testId: string;
}

const Tile: React.FC<TileProps> = ({ metric, icon, label, value, tone: tileTone = 'none', testId }) => (
  <div className={`lu-px-card lu-tile lu-tile-${metric} lu-tile-${tileTone}`} data-testid={testId}>
    <span className="lu-tile-badge">
      <PixelIcon name={icon} />
    </span>
    <span className="lu-tile-value lu-display">{value}</span>
    <span className="lu-tile-label">{label}</span>
  </div>
);

/** This month's body-fat and muscle change, and the join date. */
const StatTiles: React.FC<{ wins: MonthlyWins; memberSince: string; today: Date }> = ({ wins, memberSince, today }) => {
  const { t } = useTranslation();
  return (
    <section className="lu-home-wins" aria-labelledby="wins-title">
      <h2 id="wins-title" className="lu-section-title">
        <IonIcon icon={sparklesOutline} aria-hidden="true" />
        {t('home.wins.title', { month: formatMonth(today) })}
      </h2>
      <div className="lu-tiles">
        <Tile
          metric="fat"
          icon="flame"
          label={t('home.wins.bodyFat')}
          value={formatSigned(wins.bodyFatChangePct, '%', { digits: 1 })}
          tone={tone(wins.bodyFatChangePct, 'down')}
          testId="tile-body-fat"
        />
        <Tile
          metric="muscle"
          icon="muscle"
          label={t('home.wins.muscle')}
          value={formatSigned(wins.muscleGainedKg, t('units.kg'), { digits: 1 })}
          tone={tone(wins.muscleGainedKg, 'up')}
          testId="tile-muscle"
        />
        <Tile
          metric="since"
          icon="calendar"
          label={t('home.wins.memberSince')}
          value={formatMonthYear(memberSince)}
          testId="tile-member-since"
        />
      </div>
    </section>
  );
};

export default StatTiles;
