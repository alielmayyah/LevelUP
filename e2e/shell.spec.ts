import { test as base } from '@playwright/test';

import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('shell applies language, direction, and theme', async ({ page }) => {
        await page.goto('/');
        const html = page.locator('html');
        await expect(html).toHaveAttribute('lang', lang);
        await expect(html).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        if (theme === 'dark') await expect(html).toHaveClass(/ion-palette-dark/);
        else await expect(html).not.toHaveClass(/ion-palette-dark/);

        await expect(page.getByTestId('page-home').locator('ion-title')).toHaveText(strings[lang].tabs.home);
        expect(await noHorizontalOverflow(page)).toBe(true);
      });

      test('page body leaves room for the floating tab bar', async ({ page }) => {
        await page.goto('/');
        const body = page.getByTestId('page-body');
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
  base.use({ locale: 'ar-EG' });

  base('follows an Arabic device language when nothing is saved', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('ion-title')).toHaveText(ar.tabs.home);
  });
});

base.describe('system theme', () => {
  base('follows the device while the app is open', async ({ page }) => {
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
