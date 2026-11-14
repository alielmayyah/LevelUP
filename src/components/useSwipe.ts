import { useEffect, useState } from 'react';

/** How far a finger must travel sideways, and how much more sideways than up or down, to count as a swipe. */
const MIN_DX = 50;
const RATIO = 1.5;

/**
 * Sideways swipes on an element: `onNext` for a swipe toward the reading
 * start (right to left in English, left to right in Arabic), `onPrev` for the
 * other way, like turning a page. Up and down movement is left alone, so a
 * sheet can still be dragged closed and a list still scrolls.
 *
 * Returns a ref callback for the element. It works for elements that appear
 * later (after data loads), since listeners attach whenever the element does.
 */
export function useSwipe({
  onNext,
  onPrev,
  rtl,
}: {
  onNext: () => void;
  onPrev: () => void;
  rtl: boolean;
}): (el: HTMLElement | null) => void {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!el) return;
    let start: { x: number; y: number } | null = null;

    const down = (e: TouchEvent) => {
      const t = e.touches[0];
      start = e.touches.length === 1 && t ? { x: t.clientX, y: t.clientY } : null;
    };
    const up = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * RATIO) return;
      // A finger moving left reveals what comes next in English; in Arabic it is the other way.
      const forward = rtl ? dx > 0 : dx < 0;
      if (forward) onNext();
      else onPrev();
    };
    const cancel = () => {
      start = null;
    };

    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchend', up, { passive: true });
    el.addEventListener('touchcancel', cancel, { passive: true });
    return () => {
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchend', up);
      el.removeEventListener('touchcancel', cancel);
    };
  }, [el, onNext, onPrev, rtl]);

  return setEl;
}
