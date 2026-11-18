import { memo } from 'react';

import { ICONS, type IconName } from '../../components/iconMap';
import { MEDAL_RARITIES, type MedalCategory, type MedalRarity } from './types';

interface Props {
  category: MedalCategory;
  rarity: MedalRarity;
  locked: boolean;
  className?: string;
}

/** The body measurement each medal is for, as the app's line icons. */
const GLYPH: Record<MedalCategory, IconName> = {
  muscle: 'muscle',
  bodyFat: 'bodyFat',
  bmi: 'gauge',
};

/** A hexagon for the two top rarities; the metals are round. */
const HEXAGON = '50,4 90,27 90,73 50,96 10,73 10,27';

/**
 * A clean vector medal: a disc (or hexagon for Epic and Legendary) in the
 * rarity's color, the category's line icon in the middle, and one pip per
 * rarity step along the bottom; a locked medal is greyed with a lock badge.
 * Art only: the surrounding card names it.
 */
const MedalArt: React.FC<Props> = ({ category, rarity, locked, className }) => {
  const Glyph = ICONS[GLYPH[category]];
  const Lock = ICONS.lock;
  const level = MEDAL_RARITIES.indexOf(rarity) + 1;
  const hex = level >= 4;
  return (
    <svg
      className={['lu-medal-art', className].filter(Boolean).join(' ')}
      data-rarity={rarity}
      data-locked={locked}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      {/* Legendary gets a soft halo behind the badge. */}
      {level === 5 && <circle className="lu-medal-halo" cx="50" cy="50" r="49" />}
      {hex ? (
        <polygon className="lu-medal-rim" points={HEXAGON} />
      ) : (
        <circle className="lu-medal-rim" cx="50" cy="50" r="44" />
      )}
      {hex ? (
        <polygon
          className="lu-medal-face"
          points={HEXAGON}
          transform="translate(50 50) scale(0.8) translate(-50 -50)"
        />
      ) : (
        <circle className="lu-medal-face" cx="50" cy="50" r="35" />
      )}
      <Glyph className="lu-medal-glyph" x={31} y={27} width={38} height={38} strokeWidth={1.9} />
      {/* Locked: a lock badge on the lower corner says it at a glance (the card's text says it to screen readers). */}
      {locked && (
        <g className="lu-medal-lock" data-testid="medal-lock">
          <circle cx="76" cy="76" r="20" />
          <Lock x={64} y={64} width={24} height={24} strokeWidth={2.4} />
        </g>
      )}
      <g className="lu-medal-pips">
        {Array.from({ length: level }, (_, i) => (
          <circle key={i} cx={50 + (i - (level - 1) / 2) * 6} cy={74} r={1.9} />
        ))}
      </g>
    </svg>
  );
};

export default memo(MedalArt);
