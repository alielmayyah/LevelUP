import Icon, { type IconName } from '../Icon';

export type Tone = 'brand' | 'good' | 'attention' | 'stable' | 'muscle' | 'fat' | 'water' | 'lean' | 'neutral';

/** A 40 px tile holding one icon: data icons in their data color, brand icons on the brand tint. */
export function IconTile({ icon, tone = 'neutral', className }: { icon: IconName; tone?: Tone; className?: string }) {
  return (
    <span className={`lu-tile ${className ?? ''}`} data-tone={tone} aria-hidden="true">
      <Icon name={icon} />
    </span>
  );
}

export default IconTile;
