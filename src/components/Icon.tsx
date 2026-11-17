import { memo } from 'react';

import { ICONS, type IconName } from './iconMap';

export type { IconName };

/** Decorative beside text. A standalone graphic can provide its own label. */
const Icon = memo(function Icon({ name, className, label }: { name: IconName; className?: string; label?: string }) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      className={className ? `lu-icon ${className}` : 'lu-icon'}
      size="1em"
      strokeWidth={1.75}
      absoluteStrokeWidth={false}
      data-icon={name}
      focusable="false"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
});

export default Icon;
