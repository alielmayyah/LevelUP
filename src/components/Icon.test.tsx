import { render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Icon from './Icon';
import { ICON_NAMES } from './iconMap';

describe('Icon', () => {
  it('draws every icon as a 24-grid line icon sized to the text', () => {
    const { container } = render(
      <>
        {ICON_NAMES.map((name) => (
          <Icon key={name} name={name} />
        ))}
      </>,
    );
    const icons = Array.from(container.querySelectorAll('svg'));
    expect(icons).toHaveLength(ICON_NAMES.length);
    icons.forEach((icon, index) => {
      const name = ICON_NAMES[index];
      expect(icon, name).toHaveAttribute('data-icon', name);
      expect(icon, name).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon, name).toHaveAttribute('stroke-width', '1.75');
      expect(icon, name).toHaveAttribute('width', '1em');
      expect(icon, name).toHaveClass('lu-icon');
      expect(icon.children.length, name).toBeGreaterThan(0);
    });
  });

  it('keeps decorative icons hidden and exposes the name of standalone icons', () => {
    const { container, rerender } = render(<Icon name="close" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(within(container).queryByRole('img')).toBeNull();
    rerender(<Icon name="check" label="Read" />);
    expect(within(container).getByRole('img', { name: 'Read' })).toHaveAttribute('focusable', 'false');
  });
});
