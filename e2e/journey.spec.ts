/*
 * S1-04: the whole app working together against the mock API, on every
 * device size (Playwright projects), in both languages and both themes.
 */
import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };
const TABS = ['home', 'progress', 'goals', 'leaderboard', 'profile'] as const;

/** True when the visible page text has no NaN, undefined, null, or [object Object]. */
const cleanText = (text: string) => !/\bNaN\b|\bundefined\b|\bnull\b|\[object Object\]/.test(text);

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('splash → sign in → every tab → sign out', async ({ page }) => {
        const s = strings[lang];
        await page.goto('/');
        await page.getByTestId('page-splash').click();
        await page.getByLabel(s.login.fitId).fill('101');
        await page.getByRole('button', { name: s.login.submit }).click();
        await expect(page).toHaveURL(/\/tabs\/home$/);

        const tablist = page.getByRole('navigation', { name: s.tabs.navLabel });
        for (const tab of TABS) {
          await tablist.getByRole('tab', { name: s.tabs.short[tab], exact: true }).click();
          await expect(page).toHaveURL(new RegExp(`/tabs/${tab}$`));
          const body = page.getByTestId(`page-${tab}`).getByTestId('page-body');
          await expect(body).toBeVisible();
          // Wait for the tab's data, then check nothing broken or sideways.
          await expect(body.locator('[aria-busy="true"]')).toHaveCount(0);
          expect(cleanText(await body.innerText())).toBe(true);
          expect(await noHorizontalOverflow(page)).toBe(true);
        }

        await page.getByRole('button', { name: s.profile.signOut }).click();
        await page.getByRole('dialog').getByRole('button', { name: s.profile.signOut }).click();
        await expect(page).toHaveURL(/\/login$/);

        // The tabs stay locked until the member signs in again.
        await page.goto('/tabs/progress');
        await expect(page).toHaveURL(/\/login$/);
      });
    });

test('a brand-new member (102) sees empty states on every tab, never NaN or undefined', async ({ page, loginAs }) => {
  await loginAs('102');
  const checks: Record<(typeof TABS)[number], string> = {
    home: en.home.fitScore.empty,
    progress: en.progress.empty,
    goals: en.goals.empty,
    leaderboard: en.leaderboard.hidden,
    profile: en.profile.personal,
  };
  for (const tab of TABS) {
    await page.goto(`/tabs/${tab}`);
    const body = page.getByTestId(`page-${tab}`).getByTestId('page-body');
    await expect(body.getByText(checks[tab])).toBeVisible();
    expect(cleanText(await body.innerText())).toBe(true);
    expect(await noHorizontalOverflow(page)).toBe(true);
  }
});

test('the tabs sit above the home indicator on every tab', async ({ page, loginAs }) => {
  await loginAs();
  for (const tab of TABS) {
    await page.goto(`/tabs/${tab}`);
    await page.evaluate(() => document.documentElement.style.setProperty('--ion-safe-area-bottom', '34px'));
    // The dock runs to the bottom edge; its tabs stay clear of the home indicator.
    const button = (await page.getByTestId(`tab-${tab}`).boundingBox())!;
    expect(button.y + button.height).toBeLessThanOrEqual(page.viewportSize()!.height - 34);
  }
});

test('every tab label is shown in full, never cut off', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  const width = page.viewportSize()!.width;
  test.skip(width < 360, 'Below 360 px the bar shows icons only.');
  const cut = await page
    .locator('.lu-tabbar ion-label')
    .evaluateAll((labels) => labels.filter((l) => l.scrollWidth > l.clientWidth + 1).map((l) => l.textContent));
  expect(cut).toEqual([]);
});
