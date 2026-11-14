import { describe, expect, it } from 'vitest';

import { swipeTarget, type Swipe } from './tabGestures';

const swipe = (startX: number, endX: number, extra: Partial<Swipe> = {}): Swipe => ({
  startX,
  startY: 400,
  endX,
  endY: 400,
  ms: 200,
  width: 390,
  ...extra,
});

describe('swipeTarget', () => {
  it('swiping left opens the next tab, right the previous one (English)', () => {
    expect(swipeTarget(swipe(300, 150), 1, 5, false)).toBe(2);
    expect(swipeTarget(swipe(100, 260), 1, 5, false)).toBe(0);
  });

  it('is mirrored in Arabic', () => {
    expect(swipeTarget(swipe(100, 260), 1, 5, true)).toBe(2);
    expect(swipeTarget(swipe(300, 150), 1, 5, true)).toBe(0);
  });

  it('stops at the first and last tabs', () => {
    expect(swipeTarget(swipe(100, 260), 0, 5, false)).toBeNull();
    expect(swipeTarget(swipe(300, 150), 4, 5, false)).toBeNull();
  });

  it('leaves edge swipes to the system back gesture', () => {
    expect(swipeTarget(swipe(10, 200), 1, 5, false)).toBeNull();
    expect(swipeTarget(swipe(380, 200), 1, 5, false)).toBeNull();
  });

  it('ignores short, slow, or mostly vertical moves', () => {
    expect(swipeTarget(swipe(200, 160), 1, 5, false)).toBeNull();
    expect(swipeTarget(swipe(300, 150, { ms: 900 }), 1, 5, false)).toBeNull();
    expect(swipeTarget(swipe(300, 200, { endY: 520 }), 1, 5, false)).toBeNull();
  });

  it('does nothing off the tab pages', () => {
    expect(swipeTarget(swipe(300, 150), -1, 5, false)).toBeNull();
  });
});
