import type { LeaderboardBoard } from '../../api/types';
import PixelIcon, { type PixelIconName } from '../../components/PixelIcon';

/** The pixel icon that says what a board's number measures: FitScore, muscle, or body fat. */
const ICON: Record<LeaderboardBoard, { name: PixelIconName; colors: string }> = {
  score: { name: 'trophy', colors: '[--px-fill:var(--lu-gold)] [--px-hi:var(--lu-fat-core)]' },
  muscle: { name: 'muscle', colors: '[--px-fill:var(--lu-muscle)] [--px-hi:var(--lu-muscle-hi)]' },
  bodyFat: {
    name: 'flame',
    colors: '[--px-core:var(--lu-fat-core)] [--px-fill:var(--lu-fat)] [--px-hi:var(--lu-fat-hi)]',
  },
};

/** Decorative: the value next to it is always read with its unit or column name. */
const MetricIcon: React.FC<{ board: LeaderboardBoard; className?: string }> = ({ board, className = '' }) => (
  <span className={`inline-grid place-items-center ${ICON[board].colors} ${className}`} aria-hidden="true">
    <PixelIcon name={ICON[board].name} />
  </span>
);

export default MetricIcon;
