import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PixelIcon, { PIXEL_ICONS, type PixelIconName } from './PixelIcon';

describe('PixelIcon', () => {
  it('draws every icon on a clean 12×12 grid of known pixels', () => {
    for (const [name, rows] of Object.entries(PIXEL_ICONS)) {
      expect(rows, name).toHaveLength(12);
      for (const row of rows) expect(row, name).toMatch(/^[XOYHC.]{12}$/);
    }
  });

  it('keeps mirrored icons mirrored', () => {
    const flipX = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(''));
    expect(PIXEL_ICONS.chevronBack).toEqual(flipX(PIXEL_ICONS.chevronForward));
    expect(PIXEL_ICONS.arrowBack).toEqual(flipX(PIXEL_ICONS.arrowForward));
    expect(PIXEL_ICONS.trendDown).toEqual([...PIXEL_ICONS.trendUp].reverse());
  });

  it('draws symmetric interface icons symmetrically', () => {
    const symmetric: PixelIconName[] = ['close', 'add', 'remove', 'dice', 'settings', 'eye', 'globe', 'info'];
    for (const name of symmetric) {
      const rows = PIXEL_ICONS[name];
      expect(
        rows.map((r) => [...r].reverse().join('')),
        name,
      ).toEqual(rows.map((r) => r));
    }
  });

  it('is hidden from screen readers unless it carries a label', () => {
    const { container, rerender } = render(<PixelIcon name="close" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(<PixelIcon name="check" label="Read" />);
    const svg = container.querySelector('svg')!;
    expect(svg).not.toHaveAttribute('aria-hidden');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Read');
  });

  it('draws interface icons in the text color', () => {
    const { container } = render(<PixelIcon name="chevronForward" />);
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
    rects.forEach((r) => expect(r).toHaveClass('px-text'));
  });
});
