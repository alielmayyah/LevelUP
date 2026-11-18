import { test as base } from '@playwright/test';

import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, seedToken, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('shell applies language, direction, and theme', async ({ page, loginAs }) => {
        await loginAs();
        await page.goto('/tabs/home');
        const html = page.locator('html');
        await expect(html).toHaveAttribute('lang', lang);
        await expect(html).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        if (theme === 'dark') await expect(html).toHaveClass(/ion-palette-dark/);
        else await expect(html).not.toHaveClass(/ion-palette-dark/);

        await expect(page.getByTestId('page-home').getByTestId('greeting')).toContainText('Mohamed');
        await expect(page.getByTestId('tab-home')).toHaveText(strings[lang].tabs.short.home);
        expect(await noHorizontalOverflow(page)).toBe(true);
      });

      test('page body leaves room for the floating tab bar', async ({ page, loginAs }) => {
        await loginAs();
        await page.goto('/tabs/home');
        const body = page.getByTestId('page-home').getByTestId('page-body');
        await expect(body).toBeVisible();
        const { padding, tabbar } = await body.evaluate((el) => {
          const css = getComputedStyle(el);
          const root = getComputedStyle(document.documentElement);
          return {
            padding: parseFloat(css.paddingBottom),
            tabbar: parseFloat(root.getPropertyValue('--lu-tabbar-height')),
          };
        });
        expect(tabbar).toBeGreaterThan(0);
        expect(padding).toBeGreaterThanOrEqual(tabbar);
      });
    });

test.describe('first launch', () => {
  base.use({ locale: 'en-US' });

  base('is Arabic and dark when nothing is saved, whatever the device says', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await seedToken(page);
    await page.goto('/tabs/home');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveClass(/ion-palette-dark/);
    await expect(page.getByTestId('tab-home')).toHaveText(ar.tabs.short.home);
  });
});

base.describe('system theme', () => {
  base('follows the device while the app is open', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('CapacitorStorage.lu.theme', 'system'));
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/ion-palette-dark/);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(html).toHaveClass(/ion-palette-dark/);
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html).not.toHaveClass(/ion-palette-dark/);
  });
});

base.describe('persistence', () => {
  base('language and theme survive a reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('CapacitorStorage.lu.lang', 'ar');
      localStorage.setItem('CapacitorStorage.lu.theme', 'dark');
    });
    await page.reload();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveClass(/ion-palette-dark/);
  });
});
