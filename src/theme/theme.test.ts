import { Preferences } from '@capacitor/preferences';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getThemeMode, initTheme, setTheme } from './theme';

type Listener = (e: MediaQueryListEvent) => void;

/** A controllable prefers-color-scheme media query. */
function mockSystemDark(initial: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initial,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);
  return {
    set(dark: boolean) {
      mql.matches = dark;
      listeners.forEach((fn) => fn({ matches: dark } as MediaQueryListEvent));
    },
  };
}

const isDark = () => document.documentElement.classList.contains('ion-palette-dark');

describe('theme', () => {
  beforeEach(async () => {
    await Preferences.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dark adds palette class', async () => {
    mockSystemDark(false);
    await initTheme();
    await setTheme('dark');
    expect(isDark()).toBe(true);
  });

  it('light removes palette class even when the system is dark', async () => {
    mockSystemDark(true);
    await initTheme();
    await setTheme('light');
    expect(isDark()).toBe(false);
  });

  it('defaults to dark, whatever the device says', async () => {
    mockSystemDark(false);
    await initTheme();
    expect(getThemeMode()).toBe('dark');
    expect(isDark()).toBe(true);
  });

  it('system follows the device live', async () => {
    const system = mockSystemDark(false);
    await initTheme();
    await setTheme('system');
    expect(isDark()).toBe(false);
    system.set(true);
    expect(isDark()).toBe(true);
    system.set(false);
    expect(isDark()).toBe(false);
  });

  it('ignores device changes when a fixed theme is chosen', async () => {
    const system = mockSystemDark(false);
    await initTheme();
    await setTheme('light');
    system.set(true);
    expect(isDark()).toBe(false);
  });

  it('stores the choice under lu.theme and restores it', async () => {
    mockSystemDark(false);
    await initTheme();
    await setTheme('dark');
    expect((await Preferences.get({ key: 'lu.theme' })).value).toBe('dark');
    document.documentElement.classList.remove('ion-palette-dark');
    await initTheme();
    expect(getThemeMode()).toBe('dark');
    expect(isDark()).toBe(true);
  });

  it('an unknown stored value falls back to dark', async () => {
    mockSystemDark(false);
    await Preferences.set({ key: 'lu.theme', value: 'purple' });
    await initTheme();
    expect(getThemeMode()).toBe('dark');
    expect(isDark()).toBe(true);
  });
});
