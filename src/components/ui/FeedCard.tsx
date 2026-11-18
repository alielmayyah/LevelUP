import { useId, type ReactNode } from 'react';

import type { IconName } from '../Icon';
import IconTile, { type Tone } from './IconTile';

export interface FeedCardProps {
  icon: IconName;
  iconTone?: Tone;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** The card's one action (a Button or a chevron row), pinned to the bottom. */
  action?: ReactNode;
  testId?: string;
  className?: string;
}

/**
 * The one card anatomy (ui-standards → Components): icon tile, title and
 * subtitle, the body, then one action row. Never nest one inside another.
 */
export function FeedCard({
  icon,
  iconTone = 'brand',
  title,
  subtitle,
  children,
  action,
  testId,
  className,
}: FeedCardProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      data-testid={testId}
      className={`grid gap-4 rounded-[20px] border border-line bg-surface-1 p-4 md:p-5 ${className ?? ''}`}
    >
      <header className="flex items-center gap-3">
        <IconTile icon={icon} tone={iconTone} />
        <div className="grid min-w-0 gap-0.5">
          <h2 id={titleId} className="m-0 text-card-title text-ink">
            {title}
          </h2>
          {subtitle && <p className="m-0 text-label font-normal text-muted">{subtitle}</p>}
        </div>
      </header>
      {children}
      {action && <div className="flex border-t border-line pt-3">{action}</div>}
    </section>
  );
}

export default FeedCard;
