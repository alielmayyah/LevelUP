import { test as base, expect, type Page } from '@playwright/test';

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
        // The first-launch intro slides are skipped unless a test clears this (see splash.spec.ts).
        localStorage.setItem(`${prefix}lu.intro`, 'seen');
      },
      { prefix: PREFS, lang, theme },
    );
    await use(page);
  },

  loginAs: async ({ page }, use) => {
    await use((fitId = '101') => seedToken(page, fitId));
  },
});

/** Writes lu.token = mock.<fitId> before the page loads. */
export async function seedToken(page: Page, fitId = '101'): Promise<void> {
  await page.addInitScript(({ key, token }) => localStorage.setItem(key, token), {
    key: `${PREFS}lu.token`,
    token: `mock.${fitId}`,
  });
}

export { expect };

export const LOCALES: Locale[] = ['en', 'ar'];

/** Community (gym room, leaderboards, member cards) is switched off until it launches. Matches the app's VITE_COMMUNITY. */
export const COMMUNITY = process.env.VITE_COMMUNITY === 'true';
const ALL_TABS = ['home', 'progress', 'goals', 'community', 'profile'] as const;
/** The tabs on the bar in this build. */
export const TABS = ALL_TABS.filter((t) => COMMUNITY || t !== 'community');
export const THEMES: Theme[] = ['light', 'dark'];

/** True when the page has no horizontal scroll. */
export const noHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
