import { test as base } from '@playwright/test';

import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };
const TABS = ['home', 'progress', 'goals', 'leaderboard', 'profile'] as const;

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('every tab opens its page and moves the pill', async ({ page, loginAs }) => {
        await loginAs();
        await page.goto('/tabs/home');
        const tablist = page.getByRole('navigation', { name: strings[lang].tabs.navLabel });
        await expect(tablist).toBeVisible();

        for (const [i, tab] of TABS.entries()) {
          await tablist.getByRole('tab', { name: strings[lang].tabs.short[tab], exact: true }).click();
          await expect(page).toHaveURL(new RegExp(`/tabs/${tab}$`));
          // Home greets the member; every other tab shows its name as the page heading.
          if (tab === 'home') await expect(page.getByTestId('page-home').getByTestId('greeting')).toBeVisible();
          else
            await expect(page.getByTestId(`page-${tab}`).getByRole('heading', { level: 1 })).toHaveText(
              strings[lang].tabs[tab],
            );
          const sign = lang === 'ar' && i > 0 ? '-' : '';
          await expect(page.getByTestId('tab-pill')).toHaveAttribute(
            'style',
            new RegExp(`translateX\\(${sign}${i * 100}%\\)`),
          );
        }
        expect(await noHorizontalOverflow(page)).toBe(true);
      });

      test('tab order follows the reading direction', async ({ page, loginAs }) => {
        await loginAs();
        await page.goto('/tabs/home');
        const home = await page.getByTestId('tab-home').boundingBox();
        const profile = await page.getByTestId('tab-profile').boundingBox();
        if (lang === 'ar') expect(home!.x).toBeGreaterThan(profile!.x);
        else expect(home!.x).toBeLessThan(profile!.x);
      });
    });

test('the pill lines up with the active tab', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/goals');
  const pill = page.getByTestId('tab-pill');
  // Wait for the slide to finish before measuring.
  await expect(pill).toHaveAttribute('style', /translateX\(200%\)/);
  await expect
    .poll(async () => {
      const p = (await pill.boundingBox())!;
      const t = (await page.getByTestId('tab-goals').boundingBox())!;
      return Math.abs(p.x + p.width / 2 - (t.x + t.width / 2));
    })
    .toBeLessThan(2);
});

test('the bar stays above the home indicator', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  // Simulate an iPhone home indicator; Ionic reads the inset from this variable.
  await page.evaluate(() => document.documentElement.style.setProperty('--ion-safe-area-bottom', '34px'));
  const box = (await page.getByRole('navigation', { name: en.tabs.navLabel }).boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height - 34);
});

test('the bar is centered and at most 480 px wide', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  const bar = (await page.locator('.lu-tabbar').boundingBox())!;
  const width = page.viewportSize()!.width;
  expect(bar.width).toBeLessThanOrEqual(480);
  expect(Math.abs(bar.x + bar.width / 2 - width / 2)).toBeLessThan(2);
});

test('labels show at 360 px and up, icons only below', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  const label = page.getByTestId('tab-home').locator('ion-label');
  // Below 360 px the label is visually hidden (1 px, clipped) but still names the tab for screen readers.
  if (page.viewportSize()!.width < 360) expect((await label.boundingBox())!.width).toBeLessThanOrEqual(1);
  else await expect(label).toBeVisible();
  await expect(page.getByRole('tab', { name: en.tabs.short.home, exact: true })).toBeVisible();
});

test('every tab button is at least 44 × 44 px', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  for (const tab of TABS) {
    const box = (await page.getByTestId(`tab-${tab}`).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test('the pill jumps instead of sliding under reduced motion', async ({ page, loginAs }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loginAs();
  await page.goto('/tabs/home');
  const duration = await page.getByTestId('tab-pill').evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration).toBe('0s');
});

base('signed out, every tab URL goes to the login screen', async ({ page }) => {
  for (const tab of TABS) {
    await page.goto(`/tabs/${tab}`);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  }
});

base('the app title is LevelUP', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('LevelUP');
});
