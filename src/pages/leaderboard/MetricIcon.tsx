import type { LeaderboardBoard } from '../../api/types';
import PixelIcon, { type PixelIconName } from '../../components/PixelIcon';

/** The icon that says what a board's number measures: FitScore, muscle, or body fat. */
const ICON: Record<LeaderboardBoard, { name: PixelIconName; colors: string }> = {
  score: { name: 'trophy', colors: '[--px-fill:var(--lu-gold)]' },
  muscle: { name: 'muscle', colors: '[--px-fill:var(--lu-muscle)]' },
  bodyFat: {
    name: 'bodyFat',
    colors: '[--px-fill:var(--lu-fat)]',
  },
};

/** Decorative: the value next to it is always read with its unit or column name. */
const MetricIcon: React.FC<{ board: LeaderboardBoard; className?: string }> = ({ board, className = '' }) => (
  <span className={`inline-grid place-items-center ${ICON[board].colors} ${className}`} aria-hidden="true">
    <PixelIcon name={ICON[board].name} />
  </span>
);

export default MetricIcon;
