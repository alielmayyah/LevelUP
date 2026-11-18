import { test as base } from '@playwright/test';

import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, TABS, test, THEMES } from './fixtures';

const strings = { en, ar };

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
        const profile = await page.getByTestId('tab-account').boundingBox();
        if (lang === 'ar') expect(home!.x).toBeGreaterThan(profile!.x);
        else expect(home!.x).toBeLessThan(profile!.x);
      });
    });

test('the pill lines up with the active tab', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/compare');
  const pill = page.getByTestId('tab-pill');
  // Wait for the slide to finish before measuring.
  await expect(pill).toHaveAttribute('style', /translateX\(200%\)/);
  await expect
    .poll(async () => {
      const p = (await pill.boundingBox())!;
      const t = (await page.getByTestId('tab-compare').boundingBox())!;
      return Math.abs(p.x + p.width / 2 - (t.x + t.width / 2));
    })
    .toBeLessThan(2);
});

test('the dock floats above the bottom edge and the home indicator', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  // Simulate an iPhone home indicator; Ionic reads the inset from this variable.
  await page.evaluate(() => document.documentElement.style.setProperty('--ion-safe-area-bottom', '34px'));
  const height = page.viewportSize()!.height;
  const bar = (await page.getByRole('navigation', { name: en.tabs.navLabel }).boundingBox())!;
  // It ends above the home indicator, with a small gap.
  expect(bar.y + bar.height).toBeLessThanOrEqual(height - 34 - 4);
  expect(bar.y + bar.height).toBeGreaterThan(height - 34 - 30);
  const tab = (await page.getByTestId('tab-home').boundingBox())!;
  expect(tab.y + tab.height).toBeLessThanOrEqual(height - 34);
});

test('the dock is inset from the sides, centered, at most 520 px wide', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  const width = page.viewportSize()!.width;
  const bar = (await page.locator('.lu-tabbar').boundingBox())!;
  expect(bar.width).toBeLessThanOrEqual(520 + 1);
  expect(bar.x).toBeGreaterThanOrEqual(8);
  expect(Math.abs(bar.x + bar.width / 2 - width / 2)).toBeLessThan(2);
  const first = (await page.getByTestId('tab-home').boundingBox())!;
  const last = (await page.getByTestId('tab-account').boundingBox())!;
  expect(Math.min(first.x, last.x)).toBeGreaterThanOrEqual(bar.x);
  expect(Math.max(first.x, last.x) + last.width).toBeLessThanOrEqual(bar.x + bar.width + 1);
});

test('the dock pairs each icon with a readable label on compact phones', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  const nav = page.getByRole('navigation', { name: en.tabs.navLabel });
  for (const tab of TABS) {
    await expect(nav.getByRole('tab', { name: en.tabs.short[tab], exact: true })).toBeVisible();
    const host = nav.getByTestId(`tab-${tab}`);
    await expect(host.locator('[data-icon]')).toHaveAttribute('viewBox', '0 0 24 24');
    const label = host.locator('ion-label');
    expect((await label.boundingBox())!.width).toBeGreaterThan(1);
    expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(false);
  }
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

test('retired Community addresses redirect to Home', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  const tablist = page.getByRole('navigation', { name: en.tabs.navLabel });
  await expect(tablist.getByRole('tab')).toHaveCount(4);
  await expect(tablist.getByRole('tab', { name: 'Community', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('rank-card')).toHaveCount(0);
  for (const path of ['/tabs/community', '/tabs/leaderboard', '/tabs/community/member/2']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/tabs\/home$/);
  }
  await page.goto('/tabs/account/settings');
  await expect(page.getByTestId('setting-show-fitscore')).toHaveCount(0);
  await expect(page.getByTestId('setting-leaderboard')).toHaveCount(0);
});
