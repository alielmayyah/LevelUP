import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Avatar from './Avatar';
import { applyCharacterPreset, defaultAvatar, stylesFor } from './catalog';

describe('avatar artwork', () => {
  it('keeps preset artwork when changing an unrelated part or the body proportions', () => {
    const config = applyCharacterPreset(defaultAvatar(), 'silver-sprinter');
    const { container, rerender } = render(<Avatar config={config} crop="full" />);
    const pathsFor = (part: string) =>
      [...container.querySelectorAll(`[data-style-layer="${part}"] path[d]`)].map((path) => path.getAttribute('d'));
    const hair = pathsFor('hair');
    const top = pathsFor('top');
    const shoes = pathsFor('shoes');
    expect(hair.length).toBeGreaterThan(0);
    expect(top.length).toBeGreaterThan(0);

    rerender(
      <Avatar
        config={{ ...config, styles: { ...stylesFor(config.styles), shoes: 'barefoot', body: 'long-limbed' } }}
        crop="full"
      />,
    );
    expect(pathsFor('hair')).toEqual(hair);
    expect(pathsFor('top')).toEqual(top);
    expect(pathsFor('shoes')).not.toEqual(shoes);
  });

  it('paints socks at different heights on exposed legs', () => {
    const config = applyCharacterPreset(defaultAvatar(), 'silver-sprinter');
    const styles = stylesFor(config.styles);
    const { container, rerender } = render(<Avatar config={config} crop="full" />);
    const sock = () => container.querySelector('[data-paint="sock-fabric"]');
    const crewStart = Number(sock()?.getAttribute('y'));
    expect(crewStart).toBeGreaterThan(0);

    rerender(<Avatar config={{ ...config, styles: { ...styles, socks: 'knee-highs' } }} crop="full" />);
    expect(Number(sock()?.getAttribute('y'))).toBeLessThan(crewStart);

    rerender(<Avatar config={{ ...config, styles: { ...styles, socks: 'no-socks' } }} crop="full" />);
    expect(sock()).toBeNull();
  });
});
