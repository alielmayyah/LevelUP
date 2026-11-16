import { render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ICONS } from './iconGlyphs';
import PixelIcon, { type PixelIconName } from './PixelIcon';

const names = Object.keys(ICONS) as PixelIconName[];

describe('PixelIcon', () => {
  it('draws every glyph with the shared proportions and a small SVG tree', () => {
    const { container } = render(
      <>
        {names.map((name) => (
          <PixelIcon key={name} name={name} />
        ))}
      </>,
    );
    const icons = Array.from(container.querySelectorAll('svg'));
    expect(icons).toHaveLength(names.length);
    icons.forEach((icon, index) => {
      const name = names[index];
      expect(icon, name).toHaveAttribute('data-icon', name);
      expect(icon, name).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon, name).toHaveAttribute('stroke-width', '1.75');
      expect(icon.children.length, name).toBeGreaterThan(0);
      expect(icon.querySelectorAll('*').length, name).toBeLessThanOrEqual(8);
    });
  });

  it('keeps decorative icons hidden and exposes the name of standalone icons', () => {
    const { container, rerender } = render(<PixelIcon name="close" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(within(container).queryByRole('img')).toBeNull();
    rerender(<PixelIcon name="check" label="Read" />);
    expect(within(container).getByRole('img', { name: 'Read' })).toHaveAttribute('focusable', 'false');
  });
});
