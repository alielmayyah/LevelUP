import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { MonthlyWins } from '../../api/types';
import Icon, { type IconName } from '../../components/Icon';
import { formatSigned } from '../../i18n/format';
import { useCountUp } from '../../motion/gsapMotion';
import { formatMonth } from './homeText';
import { TILES } from './layout';

type Tone = 'good' | 'bad' | 'none';

/** The badge in the block's corner: a check for good news, a warning for the wrong way. */
const TONE_ICON: Record<Exclude<Tone, 'none'>, IconName> = { good: 'checkCircle', bad: 'warning' };

/** Each metric's block color (kit.css). */
const BLOCK = { fat: 'lu-block-fat', muscle: 'lu-block-muscle', bmi: 'lu-block-lime' } as const;

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
  /** The third block runs full width as one short row. */
  wide?: boolean;
}

/**
 * One metric as a solid color block: its icon and good/bad badge on top, the
 * month's change as a big number (counted up the first time it shows), and
 * the metric's name under it. Ink text in both themes.
 */
const Tile: React.FC<TileProps> = ({ metric, icon, label, change, unit, tone: tileTone = 'none', testId, wide }) => {
  const { t } = useTranslation();
  const value = useRef<HTMLSpanElement>(null);
  const format = (n: number) => formatSigned(Math.round(n * 10) / 10, unit, { digits: 1 });
  useCountUp(value, change, format, 1.1);

  const badge = (
    <span className="lu-block-badge size-10 flex-none text-[1.2rem]" aria-hidden="true">
      <Icon name={icon} />
    </span>
  );
  const toneBadge = tileTone !== 'none' && (
    <span className="lu-block-badge size-7 flex-none text-[0.95rem]" aria-hidden="true" data-pop>
      <Icon name={TONE_ICON[tileTone]} />
    </span>
  );
  const number = (
    <span className="lu-display inline-flex items-center gap-1 text-[clamp(1.5rem,7vw,2rem)] leading-none whitespace-nowrap">
      {/* Which way it moved, not by color alone. Never mirrored: up is up in both languages. */}
      {change !== 0 && <Icon className="flex-none text-[0.7em]" name={change > 0 ? 'trendUp' : 'trendDown'} />}
      <span ref={value}>{formatSigned(change, unit, { digits: 1 })}</span>
    </span>
  );
  const name = <span className="lu-block-muted text-[0.875rem] leading-tight font-semibold">{label}</span>;

  return (
    <div
      className={`lu-block ${BLOCK[metric]} lu-tile lu-tile-${metric} lu-tile-${tileTone} relative overflow-hidden p-4 ${wide ? 'flex items-center gap-3' : 'grid min-h-[132px] content-between gap-3'}`}
      data-testid={testId}
    >
      {wide ? (
        <>
          {badge}
          <span className="me-auto flex min-w-0 items-center gap-2">
            {name}
            {toneBadge}
          </span>
          {number}
        </>
      ) : (
        <>
          <span className="flex items-start justify-between gap-2">
            {badge}
            {toneBadge}
          </span>
          <span className="grid gap-0.5">
            {number}
            {name}
          </span>
        </>
      )}
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
      <h2 id="wins-title" className="lu-section-title mt-1.5">
        {t('home.wins.title', { month: formatMonth(today) })}
      </h2>
      {tiles.length > 0 ? (
        <div className={TILES}>
          {tiles.map((tile, i) => (
            <Tile key={tile.testId} {...tile} wide={i === 2} />
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
