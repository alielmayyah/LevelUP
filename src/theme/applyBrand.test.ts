import { afterEach, describe, expect, it } from 'vitest';

import { brand } from '../brand.config';
import { applyBrand, contrastColor } from './applyBrand';

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
