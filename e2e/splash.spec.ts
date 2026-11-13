import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('splash shows the brand and moves on to login', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/splash$/);
        const splash = page.getByTestId('page-splash');
        await expect(splash.getByTestId('splash-logo')).toBeVisible();
        await expect(splash.getByRole('heading', { name: 'LevelUP' })).toBeVisible();
        await expect(splash.getByText(strings[lang].splash.tagline)).toBeVisible();
        const cta = splash.getByRole('button', { name: strings[lang].splash.cta });
        await expect(cta).toBeInViewport();
        expect(await noHorizontalOverflow(page)).toBe(true);

        await cta.click();
        await expect(page).toHaveURL(/\/login$/);
      });

      test('sound toggle sits in the top inline-end corner', async ({ page }) => {
        await page.goto('/splash');
        const toggle = page.getByRole('button', { name: strings[lang].sound.mute });
        await expect(toggle).toBeVisible();
        const box = (await toggle.boundingBox())!;
        const width = page.viewportSize()!.width;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        if (lang === 'ar') expect(box.x + box.width / 2).toBeLessThan(width / 2);
        else expect(box.x + box.width / 2).toBeGreaterThan(width / 2);

        await toggle.click();
        await expect(page.getByRole('button', { name: strings[lang].sound.unmute })).toBeVisible();
        await expect(page).toHaveURL(/\/splash$/);
      });
    });

test('signed-in member skips login', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/splash');
  await page.getByTestId('page-splash').click();
  await expect(page).toHaveURL(/\/tabs\/home$/);
});

test('sound choice survives a reload', async ({ page }) => {
  await page.goto('/splash');
  await page.getByRole('button', { name: en.sound.mute }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: en.sound.unmute })).toBeVisible();
});

test.describe('landscape phone', () => {
  test.use({ viewport: { width: 667, height: 375 } });

  test('call to action is visible without scrolling', async ({ page }) => {
    await page.goto('/splash');
    await expect(page.getByRole('button', { name: en.splash.cta })).toBeInViewport({ ratio: 1 });
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('starfield and glow ring stand still', async ({ page }) => {
    await page.goto('/splash');
    const animations = await page
      .getByTestId('page-splash')
      .evaluate((el) =>
        [el, ...el.querySelectorAll('*')]
          .flatMap((n) => [null, '::before', '::after'].map((p) => getComputedStyle(n, p).animationName))
          .filter((a) => a !== 'none'),
      );
    expect(animations).toEqual([]);
  });
});
