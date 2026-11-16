import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PixelIcon, { PIXEL_ICONS, type PixelIconName } from './PixelIcon';
import { DETAIL, detailed, scale2x } from './scale2x';

describe('PixelIcon', () => {
  it('draws every icon on a clean square grid (12 or 24) of known pixels', () => {
    for (const [name, rows] of Object.entries(PIXEL_ICONS)) {
      expect([12, 24], name).toContain(rows.length);
      for (const row of rows) expect(row, name).toMatch(new RegExp(`^[XOYHC.]{${rows.length}}$`));
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

  it('renders at double resolution, smoothing diagonals but keeping straight edges', () => {
    // A diagonal: the corners between the two pixels fill in.
    expect(scale2x(['....', '.C..', '..C.', '....'])).toEqual([
      '........',
      '........',
      '..CC....',
      '..CCC...',
      '...CCC..',
      '....CC..',
      '........',
      '........',
    ]);
    // A straight bar stays a bar.
    expect(scale2x(['CC', '..'])).toEqual(['CCCC', 'CCCC', '....', '....']);
    for (const rows of Object.values(PIXEL_ICONS)) {
      const big = detailed(rows);
      expect(big).toHaveLength(DETAIL);
      for (const row of big) expect(row).toHaveLength(DETAIL);
    }
  });

  it('stays a light SVG at 96 × 96: runs merge across rows', () => {
    for (const name of Object.keys(PIXEL_ICONS) as PixelIconName[]) {
      const { container, unmount } = render(<PixelIcon name={name} />);
      expect(container.querySelector('svg')).toHaveAttribute('viewBox', `0 0 ${DETAIL} ${DETAIL}`);
      expect(container.querySelectorAll('rect').length, name).toBeLessThan(400);
      unmount();
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
