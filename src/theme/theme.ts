import { Preferences } from '@capacitor/preferences';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'lu.theme';
const DARK_CLASS = 'ion-palette-dark';

let mode: ThemeMode = 'system';
let systemQuery: MediaQueryList | null = null;

const isMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark' || value === 'system';

function apply(): void {
  const dark = mode === 'dark' || (mode === 'system' && !!systemQuery?.matches);
  document.documentElement.classList.toggle(DARK_CLASS, dark);
}

const onSystemChange = (): void => {
  if (mode === 'system') apply();
};

function watchSystem(): void {
  systemQuery?.removeEventListener('change', onSystemChange);
  systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemQuery.addEventListener('change', onSystemChange);
}

/** Restores the saved theme (default System) and starts following the device. */
export async function initTheme(): Promise<void> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  mode = isMode(value) ? value : 'system';
  watchSystem();
  apply();
}

export async function setTheme(next: ThemeMode): Promise<void> {
  mode = next;
  apply();
  await Preferences.set({ key: STORAGE_KEY, value: next });
}

export function getThemeMode(): ThemeMode {
  return mode;
}
