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
  /** The change this month; never null here (null tiles are not drawn). */
  change: number;
  unit: string;
  tone?: Tone;
  testId: string;
}

const Tile: React.FC<TileProps> = ({ metric, icon, label, change, unit, tone: tileTone = 'none', testId }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`lu-card lu-tile lu-tile-${metric} lu-tile-${tileTone} relative grid content-start gap-2 overflow-hidden p-3`}
      data-testid={testId}
    >
      <span className="flex min-w-0 items-center gap-2 text-[0.8125rem] leading-tight font-semibold text-muted">
        <span className="lu-tile-badge grid size-8 flex-none place-items-center rounded-full text-[1.05rem]">
          <Icon name={icon} />
        </span>
        <span className="min-w-0">{label}</span>
      </span>
      <span
        className={`lu-display inline-flex items-center gap-1 text-[clamp(1.3rem,5.6vw,1.6rem)] leading-[1.1] whitespace-nowrap ${VALUE_COLOR[tileTone]}`}
      >
        {/* Which way it moved, not by color alone. Never mirrored: up is up in both languages. */}
        {change !== 0 && (
          <Icon
            className="flex-none text-[0.8em] [--icon-color:currentColor]"
            name={change > 0 ? 'trendUp' : 'trendDown'}
          />
        )}
        {formatSigned(change, unit, { digits: 1 })}
      </span>
      {tileTone !== 'none' && <span className="sr-only">{t(`home.wins.${tileTone}`)}</span>}
    </div>
  );
};

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

/**
 * This month's body-fat, muscle, and BMI change. Tiles without a value this
 * month are left out; with none at all, one line says when they show up.
 */
const StatTiles: React.FC<{ wins: MonthlyWins; today: Date }> = ({ wins, today }) => {
  const { t } = useTranslation();
  const kg = t('units.kg');
  const tiles: TileProps[] = [];
  if (wins.bodyFatChangePct !== null)
    tiles.push({
      metric: 'fat',
      icon: 'bodyFat',
      label: t('home.wins.bodyFat'),
      change: wins.bodyFatChangePct,
      unit: '%',
      tone: tone(wins.bodyFatChangePct, 'down'),
      testId: 'tile-body-fat',
    });
  if (wins.muscleGainedKg !== null)
    tiles.push({
      metric: 'muscle',
      icon: 'muscle',
      label: t('home.wins.muscle'),
      change: wins.muscleGainedKg,
      unit: kg,
      tone: tone(wins.muscleGainedKg, 'up'),
      testId: 'tile-muscle',
    });
  if (wins.bmiChange !== null)
    tiles.push({
      metric: 'bmi',
      icon: 'ruler',
      label: t('home.wins.bmi'),
      change: wins.bmiChange,
      unit: '',
      tone: bmiTone(wins.bmiChange, wins.bmi),
      testId: 'tile-bmi',
    });

  return (
    <section aria-labelledby="wins-title">
      <h2 id="wins-title" className="lu-section-title">
        {t('home.wins.title', { month: formatMonth(today) })}
      </h2>
      {tiles.length > 0 ? (
        <div className={TILES}>
          {tiles.map((tile) => (
            <Tile key={tile.testId} {...tile} />
          ))}
        </div>
      ) : (
        <p className="m-0 font-normal text-muted" data-testid="wins-empty">
          {t('home.wins.none')}
        </p>
      )}
    </section>
  );
};

export default StatTiles;
