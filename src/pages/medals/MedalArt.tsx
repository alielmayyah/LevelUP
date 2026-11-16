import { memo } from 'react';

import { medalSprite } from './art';
import type { MedalCategory, MedalRarity } from './types';

interface Props {
  category: MedalCategory;
  rarity: MedalRarity;
  locked: boolean;
  className?: string;
}

/** Art only. The surrounding card or dialog provides the achievement's name and target. */
const MedalArt: React.FC<Props> = ({ category, rarity, locked, className }) => {
  const { sheet, crop } = medalSprite(category, rarity);
  const [x, y, width, height] = crop;
  const viewBox = crop.join(' ');
  return (
    <svg
      className={['lu-medal-art', className].filter(Boolean).join(' ')}
      data-rarity={rarity}
      data-locked={locked}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
    >
      <svg x={x} y={y} width={width} height={height} viewBox={viewBox} overflow="hidden">
        <image href={sheet.src} width={sheet.width} height={sheet.height} preserveAspectRatio="none" />
      </svg>
    </svg>
  );
};

export default memo(MedalArt);
