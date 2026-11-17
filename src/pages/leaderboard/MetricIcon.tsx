import type { LeaderboardBoard } from '../../api/types';
import Icon, { type IconName } from '../../components/Icon';

/** The icon that says what a board's number measures: FitScore, muscle, or body fat. */
const ICON: Record<LeaderboardBoard, { name: IconName; colors: string }> = {
  score: { name: 'trophy', colors: '[--icon-color:var(--lu-gold)]' },
  muscle: { name: 'muscle', colors: '[--icon-color:var(--lu-muscle)]' },
  bodyFat: {
    name: 'bodyFat',
    colors: '[--icon-color:var(--lu-fat)]',
  },
};

/** Decorative: the value next to it is always read with its unit or column name. */
const MetricIcon: React.FC<{ board: LeaderboardBoard; className?: string }> = ({ board, className = '' }) => (
  <span className={`inline-grid place-items-center ${ICON[board].colors} ${className}`} aria-hidden="true">
    <Icon name={ICON[board].name} />
  </span>
);

export default MetricIcon;
