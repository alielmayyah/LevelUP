import type { KeyboardEvent } from 'react';

/**
 * Arrow-key movement for a row of tabs or radio buttons (WAI-ARIA tabs and
 * radio group patterns). Returns the index to move to, or null for other keys.
 * "Next" follows the reading direction, so in Arabic it is ArrowLeft.
 * Up/Down also work, for two-row layouts.
 */
export function rovingTarget(e: KeyboardEvent, index: number, count: number, rtl: boolean): number | null {
  const next = rtl ? 'ArrowLeft' : 'ArrowRight';
  const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
  let to: number | null = null;
  if (e.key === next || e.key === 'ArrowDown') to = (index + 1) % count;
  else if (e.key === prev || e.key === 'ArrowUp') to = (index - 1 + count) % count;
  else if (e.key === 'Home') to = 0;
  else if (e.key === 'End') to = count - 1;
  if (to !== null) e.preventDefault();
  return to;
}

/** Moves focus to the matching button inside the same group. */
export function focusSibling(e: KeyboardEvent, index: number): void {
  const group = (e.currentTarget as HTMLElement).parentElement;
  (group?.children[index] as HTMLElement | undefined)?.focus();
}
