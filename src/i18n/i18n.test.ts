import { Preferences } from '@capacitor/preferences';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ar from './ar.json';
import en from './en.json';
import i18n, { currentLanguage, detectDeviceLanguage, initLanguage, setLanguage } from './index';

type Tree = { [key: string]: string | Tree };

const keys = (tree: Tree, prefix = ''): string[] =>
  Object.entries(tree)
    .flatMap(([k, v]) => (typeof v === 'string' ? [`${prefix}${k}`] : keys(v, `${prefix}${k}.`)))
    .sort();

describe('i18n', () => {
  beforeEach(async () => {
    await Preferences.clear();
  });
  afterEach(async () => {
    await setLanguage('en');
    vi.restoreAllMocks();
  });

  it('en and ar have identical key sets', () => {
    expect(keys(ar as Tree)).toEqual(keys(en as Tree));
  });

  it('no translation is empty', () => {
    const empty = (tree: Tree): string[] =>
      Object.entries(tree).flatMap(([k, v]) => (typeof v === 'string' ? (v.trim() ? [] : [k]) : empty(v)));
    expect(empty(en as Tree)).toEqual([]);
    expect(empty(ar as Tree)).toEqual([]);
  });

  it('ar sets rtl', async () => {
    await setLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(i18n.t('tabs.home')).toBe('الرئيسية');
  });

  it('en sets ltr again', async () => {
    await setLanguage('ar');
    await setLanguage('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(i18n.t('tabs.home')).toBe('Home');
  });

  it('stores the choice under lu.lang', async () => {
    await setLanguage('ar');
    expect((await Preferences.get({ key: 'lu.lang' })).value).toBe('ar');
  });

  it('a stored choice wins over the device language', async () => {
    await Preferences.set({ key: 'lu.lang', value: 'ar' });
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    await initLanguage();
    expect(currentLanguage()).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('first launch follows an Arabic device', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ar-EG');
    await initLanguage();
    expect(currentLanguage()).toBe('ar');
  });

  it('first launch falls back to English for any other device language', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
    await initLanguage();
    expect(currentLanguage()).toBe('en');
  });

  it('detectDeviceLanguage', () => {
    expect(detectDeviceLanguage('ar')).toBe('ar');
    expect(detectDeviceLanguage('AR-sa')).toBe('ar');
    expect(detectDeviceLanguage('en-GB')).toBe('en');
    expect(detectDeviceLanguage('')).toBe('en');
  });
});
