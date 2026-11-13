import { test as base, expect } from '@playwright/test';

export type Locale = 'en' | 'ar';
export type Theme = 'light' | 'dark';

/** Capacitor Preferences on the web stores keys in localStorage with this prefix. */
const PREFS = 'CapacitorStorage.';

interface Options {
  /** App language, written to lu.lang before the page loads. */
  lang: Locale;
  /** App theme, written to lu.theme; also sets the browser's color scheme. */
  theme: Theme;
}

interface Fixtures {
  /** Signs in as a mock member by writing lu.token = mock.<fitId> before load. */
  loginAs: (fitId?: string) => Promise<void>;
}

export const test = base.extend<Options & Fixtures>({
  lang: ['en', { option: true }],
  theme: ['light', { option: true }],

  page: async ({ page, lang, theme }, use) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.addInitScript(
      ({ prefix, lang, theme }) => {
        localStorage.setItem(`${prefix}lu.lang`, lang);
        localStorage.setItem(`${prefix}lu.theme`, theme);
      },
      { prefix: PREFS, lang, theme },
    );
    await use(page);
  },

  loginAs: async ({ page }, use) => {
    await use(async (fitId = '100001') => {
      await page.addInitScript(
        ({ key, token }) => localStorage.setItem(key, token),
        { key: `${PREFS}lu.token`, token: `mock.${fitId}` },
      );
    });
  },
});

export { expect };

export const LOCALES: Locale[] = ['en', 'ar'];
export const THEMES: Theme[] = ['light', 'dark'];

/** True when the page has no horizontal scroll. */
export const noHorizontalOverflow = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
