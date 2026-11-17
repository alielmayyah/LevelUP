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
import manifest from '../../public/avatar/hd-casual-layers/manifest.json';
import { HD_CANVAS, HD_LAYERS } from './hdFigure';

describe('HD figure', () => {
  it('matches the asset manifest: canvas, draw order and placement', () => {
    expect({ width: manifest.width, height: manifest.height }).toEqual(HD_CANVAS);
    expect(HD_LAYERS.map(({ id, x, y, width, height }) => ({ id, x, y, width, height }))).toEqual(
      manifest.layers.map(({ id, x, y, width, height }) => ({ id, x, y, width, height })),
    );
  });

  it('draws every layer in order and tints only recolored parts', () => {
    const look = { ...defaultAvatar(), colors: { ...defaultAvatar().colors, top: 'royal' } };
    const { container } = render(<Avatar config={look} crop="full" />);
    const images = [...container.querySelectorAll('image')];
    expect(images.map((i) => i.dataset.layer)).toEqual(HD_LAYERS.map((l) => l.id));
    expect(container.querySelectorAll('filter')).toHaveLength(1);
    const hoodie = images.find((i) => i.dataset.layer === 'hoodie')!;
    expect(hoodie.getAttribute('filter')).toMatch(/^url\(#lu-av-.+-top\)$/);
    expect(hoodie.dataset.color).toBe('royal');
    expect(images.find((i) => i.dataset.layer === 'hair')!.getAttribute('filter')).toBeNull();
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
    const random = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 50; i++) expect(isValidAvatar(randomAvatar(random))).toBe(true);
  });
});
