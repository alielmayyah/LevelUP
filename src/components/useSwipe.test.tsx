import { render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useSwipe } from './useSwipe';

function Strip({ onNext, onPrev, rtl = false }: { onNext: () => void; onPrev: () => void; rtl?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSwipe(ref, { onNext, onPrev, rtl });
  return <div ref={ref} data-testid="strip" />;
}

/** A one-finger swipe from (x0, y0) to (x1, y1). */
function swipe(el: Element, [x0, y0]: [number, number], [x1, y1]: [number, number]) {
  const touch = (x: number, y: number) => ({ clientX: x, clientY: y }) as Touch;
  el.dispatchEvent(Object.assign(new Event('touchstart'), { touches: [touch(x0, y0)] }));
  el.dispatchEvent(Object.assign(new Event('touchend'), { changedTouches: [touch(x1, y1)] }));
}

describe('useSwipe', () => {
  it('a swipe to the left turns forward, to the right turns back', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const { getByTestId } = render(<Strip onNext={onNext} onPrev={onPrev} />);
    swipe(getByTestId('strip'), [300, 100], [180, 110]);
    expect(onNext).toHaveBeenCalledTimes(1);
    swipe(getByTestId('strip'), [100, 100], [220, 95]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('is mirrored in Arabic', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const { getByTestId } = render(<Strip onNext={onNext} onPrev={onPrev} rtl />);
    swipe(getByTestId('strip'), [100, 100], [220, 100]);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('ignores short moves and mostly vertical drags (closing a sheet, scrolling)', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const { getByTestId } = render(<Strip onNext={onNext} onPrev={onPrev} />);
    swipe(getByTestId('strip'), [200, 100], [170, 100]);
    swipe(getByTestId('strip'), [200, 100], [140, 300]);
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });
});
