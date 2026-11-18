import { afterEach, describe, expect, it } from 'vitest';

import { brand } from '../brand.config';
import { applyBrand, applyGymBrand, brandLayer, contrastColor } from './applyBrand';

const root = document.documentElement;
const v = (name: string) => root.style.getPropertyValue(name);

describe('applyBrand', () => {
  afterEach(() => {
    root.removeAttribute('style');
  });

  it('applyBrand sets css vars and title', () => {
    applyBrand({ ...brand, colors: { ...brand.colors, primary: '#ff0000' } });
    expect(v('--ion-color-primary')).toBe('#ff0000');
    expect(document.title).toBe('LevelUP');
  });

  it('the title comes from the config', () => {
    applyBrand({ ...brand, name: 'LevelUP Beta' });
    expect(document.title).toBe('LevelUP Beta');
  });

  it('sets every variant Ionic needs for primary and secondary', () => {
    applyBrand({ ...brand, colors: { primary: '#ff0000', secondary: '#0000ff', accent: '#00ff00' } });
    expect(v('--ion-color-primary-rgb')).toBe('255, 0, 0');
    expect(v('--ion-color-primary-shade')).toBe('#e00000');
    expect(v('--ion-color-primary-tint')).toBe('#ff1a1a');
    expect(v('--ion-color-primary-contrast')).toBe('#000000');
    expect(v('--ion-color-primary-contrast-rgb')).toBe('0, 0, 0');
    expect(v('--ion-color-secondary')).toBe('#0000ff');
    expect(v('--ion-color-secondary-contrast')).toBe('#ffffff');
    expect(v('--lu-accent')).toBe('#00ff00');
    expect(v('--lu-accent-contrast')).toBe('#000000');
  });

  it('accepts short hex and normalizes case', () => {
    applyBrand({ ...brand, colors: { ...brand.colors, primary: '#F0A' } });
    expect(v('--ion-color-primary')).toBe('#ff00aa');
  });

  it('rejects a color that is not hex', () => {
    expect(() => applyBrand({ ...brand, colors: { ...brand.colors, primary: 'red' } })).toThrow(/primary/);
  });

  it('the default brand keeps button text readable (≥ 4.5:1)', () => {
    applyBrand();
    expect(v('--ion-color-primary-contrast')).toBe('#ffffff');
  });
});

describe('contrastColor', () => {
  it('picks the more readable of black and white', () => {
    expect(contrastColor('#ffeb3b')).toBe('#000000');
    expect(contrastColor('#1a237e')).toBe('#ffffff');
    expect(contrastColor('#6c3cf0')).toBe('#ffffff');
  });
});

describe('brandLayer', () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const SURFACE_2 = { dark: '#1d1929', light: '#f1eef8' } as const;

  const gyms = {
    levelup: '#8b5cf6',
    'iron box': '#ff6a1a',
    'pulse gym': '#12b5a6',
  };

  for (const [name, color] of Object.entries(gyms)) {
    for (const theme of ['dark', 'light'] as const) {
      it(`${name} (${theme}): every pairing keeps its contrast`, () => {
        const l = brandLayer(color, theme);
        expect(ratio(l.onBrand, l.brandStrong)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(l.brandSoft, SURFACE_2[theme])).toBeGreaterThanOrEqual(4.5);
        expect(ratio(l.brand, SURFACE_2[theme])).toBeGreaterThanOrEqual(3);
      });
    }
  }

  it('orange and teal get a dark label; violet keeps white', () => {
    expect(brandLayer(gyms['iron box'], 'dark').onBrand).toBe('#0c0a14');
    expect(brandLayer(gyms['pulse gym'], 'dark').onBrand).toBe('#0c0a14');
    expect(brandLayer(gyms.levelup, 'dark').onBrand).toBe('#ffffff');
  });

  it('applyGymBrand writes both themes and null removes them', () => {
    applyGymBrand('#ff6a1a');
    const css = document.getElementById('lu-gym-brand')?.textContent ?? '';
    expect(css).toContain(':root {');
    expect(css).toContain(':root.ion-palette-dark {');
    expect(css).toContain('--lu-on-brand: #0c0a14;');
    applyGymBrand(null);
    expect(document.getElementById('lu-gym-brand')).toBeNull();
  });
});
