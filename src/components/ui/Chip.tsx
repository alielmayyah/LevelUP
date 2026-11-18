import type { ReactNode } from 'react';

import Icon, { type IconName } from '../Icon';

export type ChipTone = 'good' | 'attention' | 'stable' | 'brand';

const DEFAULT_ICON: Record<ChipTone, IconName | null> = {
  good: 'checkCircle',
  attention: 'warning',
  stable: 'remove',
  brand: null,
};

/**
 * A pill with an icon and a word. Meaning chips never rely on color alone:
 * good gets a check, attention a warning triangle, stable a dash.
 */
export function Chip({
  tone,
  children,
  icon,
  testId,
}: {
  tone: ChipTone;
  children: ReactNode;
  /** Overrides the tone's icon; null for none. */
  icon?: IconName | null;
  testId?: string;
}) {
  const glyph = icon === undefined ? DEFAULT_ICON[tone] : icon;
  return (
    <span
      className="lu-chip-tone inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-label"
      data-tone={tone}
      data-testid={testId}
    >
      {glyph && <Icon name={glyph} className="shrink-0 text-[1em]" />}
      {children}
    </span>
  );
}

export default Chip;
