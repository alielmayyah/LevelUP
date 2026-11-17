import { useTranslation } from 'react-i18next';

import type { MonthlyWins } from '../../api/types';
import Icon, { type IconName } from '../../components/Icon';
import { formatSigned } from '../../i18n/format';
import { formatMonth } from './homeText';
import { TILES } from './layout';

type Tone = 'good' | 'bad' | 'none';

/** Green or red says good or bad; no change stays muted. */
const VALUE_COLOR: Record<Tone, string> = { good: 'text-success', bad: 'text-danger', none: 'text-muted' };

/** Fat going down is good; muscle going up is good. */
const tone = (value: number | null, goodWhen: 'down' | 'up'): Tone => {
  if (value === null || value === 0) return 'none';
  return value < 0 === (goodWhen === 'down') ? 'good' : 'bad';
};

interface TileProps {
  metric: 'fat' | 'muscle' | 'bmi';
  icon: IconName;
  label: string;
  value: string;
  tone?: Tone;
  testId: string;
}

const Tile: React.FC<TileProps> = ({ metric, icon, label, value, tone: tileTone = 'none', testId }) => (
  <div
    className={`lu-card lu-tile lu-tile-${metric} lu-tile-${tileTone} relative grid justify-items-center gap-1 overflow-hidden px-2 pt-4 pb-3 text-center`}
    data-testid={testId}
  >
    <span className="mt-0.5 mb-1 grid place-items-center text-[48px]">
      <Icon name={icon} />
    </span>
    <span
      className={`lu-display text-[clamp(1.55rem,6.8vw,2.1rem)] leading-[1.1] whitespace-nowrap ${VALUE_COLOR[tileTone]}`}
    >
      {value}
    </span>
    <span className="text-[0.78rem] font-bold text-muted">{label}</span>
  </div>
);

/**
 * BMI has no single good direction: above the 18.5–25 range, down is good
 * news; below it, up is; inside it, any change stays neutral.
 */
const bmiTone = (change: number | null, bmi: number | null): Tone => {
  if (bmi === null) return 'none';
  if (bmi > 25) return tone(change, 'down');
  if (bmi < 18.5) return tone(change, 'up');
  return 'none';
};

/** This month's body-fat, muscle, and BMI change. */
const StatTiles: React.FC<{ wins: MonthlyWins; today: Date }> = ({ wins, today }) => {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="wins-title">
      <h2 id="wins-title" className="lu-section-title">
        <Icon name="sparkles" />
        {t('home.wins.title', { month: formatMonth(today) })}
      </h2>
      <div className={TILES}>
        <Tile
          metric="fat"
          icon="bodyFat"
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
          metric="bmi"
          icon="ruler"
          label={t('home.wins.bmi')}
          value={formatSigned(wins.bmiChange, '', { digits: 1 })}
          tone={bmiTone(wins.bmiChange, wins.bmi)}
          testId="tile-bmi"
        />
      </div>
    </section>
  );
};

export default StatTiles;
