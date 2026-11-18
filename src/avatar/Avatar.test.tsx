import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Avatar from './Avatar';
import {
  AVATAR_PARTS,
  defaultAvatar,
  isValidAvatar,
  memberAvatar,
  normalizeAvatar,
  presetsFor,
  randomAvatar,
  sameAvatar,
} from './catalog';

describe('Avatar portrait', () => {
  it('composes the illustrated portrait with the selected face, eyes and outfit', () => {
    const starter = defaultAvatar();
    const { container } = render(
      <Avatar
        config={{
          ...starter,
          colors: { ...starter.colors, skin: 'brown', hair: 'grey', top: 'forest' },
          portrait: { look: 'fade', outfit: 'jacket', eyes: 'green' },
        }}
      />,
    );
    expect(container.querySelector('svg')).toHaveAttribute('data-figure', 'hd-portrait');
    const layers = [...container.querySelectorAll('image')];
    expect(layers.map((image) => image.dataset.layer)).toEqual(['head', 'skin', 'hair', 'eyes', 'outfit']);
    expect(layers[0].getAttribute('href')).toMatch(/\/cartoon-portrait\/fade-head\.webp$/);
    expect(layers[4].getAttribute('href')).toMatch(/\/cartoon-portrait\/jacket\.webp$/);
    expect(layers[0]).not.toHaveAttribute('filter');
    expect(layers[1]).toHaveAttribute('data-color', 'brown');
    expect(layers[2]).toHaveAttribute('data-color', 'grey');
    expect(layers[3]).toHaveAttribute('data-color', 'green');
    expect(container.querySelectorAll('filter')).toHaveLength(4);
  });

  it('uses the girl artwork and outfit for female profiles, including older saved looks', () => {
    const config = { ...defaultAvatar(), portrait: { look: 'fade', outfit: 'hoodie', eyes: 'green' } as const };
    const { container, rerender } = render(<Avatar config={config} sex="FEMALE" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-portrait-sex', 'FEMALE');
    expect(container.querySelector('[data-layer="head"]')).toHaveAttribute(
      'href',
      expect.stringMatching(/girl-curls-head/),
    );
    expect(container.querySelector('[data-layer="outfit"]')).toHaveAttribute(
      'href',
      expect.stringMatching(/girl-hoodie/),
    );
    expect(container.querySelector('[data-layer="eyes"]')).toHaveAttribute('data-color', 'green');

    const updated = { ...config, portrait: { ...config.portrait, look: 'bun' as const } };
    expect(isValidAvatar(updated)).toBe(true);
    expect(normalizeAvatar(updated)).toEqual(updated);
    rerender(<Avatar config={updated} sex="FEMALE" />);
    expect(container.querySelector('[data-layer="head"]')).toHaveAttribute(
      'href',
      expect.stringMatching(/girl-bun-head/),
    );
  });

  it('composites a separately colored hijab over the outfit and preserves the stored hair color', () => {
    const config = {
      ...defaultAvatar(),
      portrait: { look: 'hijab', outfit: 'jacket', eyes: 'hazel', hijabColor: 'ivory' } as const,
    };
    expect(isValidAvatar(config)).toBe(true);
    expect(isValidAvatar({ ...config, portrait: { ...config.portrait, hijabColor: 'unknown' } })).toBe(false);
    const { container } = render(<Avatar config={config} sex="FEMALE" />);
    const layers = [...container.querySelectorAll('image')];
    expect(layers.map((image) => image.dataset.layer)).toEqual(['outfit', 'head', 'hijab', 'eyes']);
    expect(layers[2]).toHaveAttribute('href', expect.stringMatching(/girl-hijab-scarf\.webp$/));
    expect(layers[2]).toHaveAttribute('data-color', 'ivory');
    expect(container.querySelector('[data-hair]')).toHaveAttribute('data-hair', config.colors.hair);
  });

  it('is hidden from screen readers unless labeled', () => {
    const { container, rerender } = render(<Avatar config={defaultAvatar()} />);
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    rerender(<Avatar config={defaultAvatar()} label="Your character" />);
    expect(container.querySelector('svg')!.getAttribute('aria-label')).toBe('Your character');
  });
});

describe('catalog', () => {
  it('every part has presets, unique ids and a valid default', () => {
    for (const part of AVATAR_PARTS) {
      const ids = presetsFor(part).map((p) => p.id);
      expect(ids.length).toBeGreaterThanOrEqual(6);
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(isValidAvatar(defaultAvatar())).toBe(true);
  });

  it('rejects unknown colors, missing parts, extra parts and old schemas', () => {
    const ok = defaultAvatar();
    expect(isValidAvatar({ ...ok, colors: { ...ok.colors, top: 'neon' } })).toBe(false);
    const missing: Record<string, string> = { ...ok.colors };
    delete missing.shoes;
    expect(isValidAvatar({ ...ok, colors: missing })).toBe(false);
    expect(isValidAvatar({ ...ok, colors: { ...ok.colors, socks: 'white' } })).toBe(false);
    expect(isValidAvatar({ ...ok, portrait: { look: 'curls', outfit: '../unknown', eyes: 'brown' } })).toBe(false);
    expect(isValidAvatar({ ...ok, schemaVersion: 1 })).toBe(false);
    expect(isValidAvatar(null)).toBe(false);
  });

  it('reads an older drawn-character save, keeping colors that still exist', () => {
    const old = { schemaVersion: 1, rig: 'standard', colors: { skin: 'brown', hair: 'not-a-color', tank: 'red' } };
    const look = normalizeAvatar(old);
    expect(isValidAvatar(look)).toBe(true);
    expect(look.colors.skin).toBe('brown');
    expect(look.colors.hair).toBe(defaultAvatar().colors.hair);
  });

  it('gives each member the same starter every time, from the member id only', () => {
    const a = memberAvatar({ memberId: 42, avatar: null });
    expect(sameAvatar(a, memberAvatar({ memberId: 42, avatar: null }))).toBe(true);
    expect(isValidAvatar(a)).toBe(true);
    const saved = { ...defaultAvatar(), colors: { ...defaultAvatar().colors, hair: 'blonde' } };
    expect(memberAvatar({ memberId: 42, avatar: saved })).toEqual(saved);
  });

  it('random looks are always valid', () => {
    let s = 0;
    const random = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 50; i++) expect(isValidAvatar(randomAvatar(random))).toBe(true);
  });
});
