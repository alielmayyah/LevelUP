import { memo } from 'react';

import { ICONS } from './iconGlyphs';

export type IconName = keyof typeof ICONS;

/** Decorative beside text. A standalone graphic can provide its own label. */
const Icon = memo(function Icon({
  name,
  className,
  label,
}: {
  name: IconName;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      className={className ? `lu-icon ${className}` : 'lu-icon'}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-icon={name}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
});

export default Icon;
