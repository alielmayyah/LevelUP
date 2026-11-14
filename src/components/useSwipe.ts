import { useEffect, type RefObject } from 'react';

/** How far a finger must travel sideways, and how much more sideways than up or down, to count as a swipe. */
const MIN_DX = 50;
const RATIO = 1.5;

/**
 * Sideways swipes on an element: `onNext` for a swipe toward the reading
 * start (right to left in English, left to right in Arabic), `onPrev` for the
 * other way, like turning a page. Up and down movement is left alone, so a
 * sheet can still be dragged closed and a list still scrolls.
 */
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  { onNext, onPrev, rtl }: { onNext: () => void; onPrev: () => void; rtl: boolean },
): void {
  useEffect(() => {
    const el = ref.current;
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
  }, [ref, onNext, onPrev, rtl]);
}
