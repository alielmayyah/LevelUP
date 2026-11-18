import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { brand } from '../src/brand.config';
import { expect, LOCALES, noHorizontalOverflow, seedToken, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('splash shows the brand, then moves on to login by itself', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/splash$/);
        const splash = page.getByTestId('page-splash');
        const logo = splash.getByRole('img', { name: brand.name });
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute('src', brand.logo);
        await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
        await expect(splash.getByRole('heading', { name: brand.name })).toHaveAccessibleDescription(
          strings[lang].splash.tagline,
        );
        await expect(splash.getByRole('status', { name: strings[lang].splash.loading })).toBeVisible();
        // A launch screen only: nothing to tap.
        await expect(splash.getByRole('button')).toHaveCount(0);
        expect(await noHorizontalOverflow(page)).toBe(true);

        await expect(page).toHaveURL(/\/login$/, { timeout: 5000 });
      });
    });

test('signed in, the splash goes straight to home', async ({ page }) => {
  await seedToken(page, '101');
  await page.goto('/splash');
  await expect(page).toHaveURL(/\/tabs\/home$/, { timeout: 5000 });
});

test('?stay keeps the splash on screen', async ({ page }) => {
  await page.goto('/splash?stay');
  await page.waitForTimeout(2500);
  await expect(page).toHaveURL(/\/splash\?stay$/);
});

test('the logo clears the notch and stays on screen', async ({ page }) => {
  await page.goto('/splash?stay');
  await page.evaluate(() => {
    const { style } = document.documentElement;
    style.setProperty('--ion-safe-area-top', '59px');
    style.setProperty('--ion-safe-area-bottom', '34px');
  });
  const bounds = (await page.getByTestId('page-splash').boundingBox())!;
  const logo = (await page.getByTestId('splash-logo').boundingBox())!;
  expect(logo.y).toBeGreaterThanOrEqual(bounds.y + 59);
  expect(logo.y + logo.height).toBeLessThanOrEqual(bounds.y + bounds.height - 34);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the logo glow holds still and the splash still moves on', async ({ page }) => {
    await page.goto('/splash');
    await expect(page.locator('.lu-splash-glow')).toHaveCSS('animation-name', 'none');
    await expect(page).toHaveURL(/\/login$/, { timeout: 5000 });
  });
});

test('first launch shows the intro slides, then login, and never again', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('CapacitorStorage.lu.intro'));
  await page.goto('/splash');
  await expect(page).toHaveURL(/\/intro$/, { timeout: 5000 });
  await expect(page.getByTestId('intro-slide-numbers')).toBeVisible();
  await page.getByTestId('intro-next').click();
  await expect(page.getByTestId('intro-slide-meaning')).toBeVisible();
  await page.getByTestId('intro-next').click();
  await page.getByTestId('intro-next').click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('CapacitorStorage.lu.intro'))).toBe('seen');
});
