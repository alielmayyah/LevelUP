import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { brand } from '../src/brand.config';
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
        const logo = splash.getByRole('img', { name: brand.name });
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute('src', brand.logo);
        await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
        await expect(splash.getByRole('heading', { name: brand.name })).toHaveAccessibleDescription(
          strings[lang].splash.tagline,
        );
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

test('intro settles with everything fully shown', async ({ page }) => {
  await page.goto('/splash');
  const splash = page.getByTestId('page-splash');
  for (const part of [
    splash.getByTestId('splash-logo'),
    splash.getByRole('heading'),
    splash.getByRole('button', { name: en.splash.cta }),
  ])
    await expect(part).toHaveCSS('opacity', '1');
});

test('the exit animation hands over to login within 600 ms', async ({ page }) => {
  await page.goto('/splash');
  await expect(page.getByRole('button', { name: en.splash.cta })).toHaveCSS('opacity', '1');
  // Time it inside the page, from the tap to the route change, so test polling doesn't count.
  await page.evaluate(() => {
    const w = window as unknown as { tapAt?: number; navAt?: number };
    document.addEventListener('click', () => (w.tapAt ??= performance.now()), { capture: true });
    const replace = history.replaceState.bind(history);
    history.replaceState = (...args) => {
      w.navAt ??= performance.now();
      return replace(...args);
    };
  });
  await page.getByTestId('page-splash').click();
  await expect(page).toHaveURL(/\/login$/);
  const elapsed = await page.evaluate(() => {
    const w = window as unknown as { tapAt: number; navAt: number };
    return w.navAt - w.tapAt;
  });
  expect(elapsed).toBeLessThanOrEqual(650); // 600 ms budget plus one frame of slack
});

test('the sound icon swaps when toggled', async ({ page }) => {
  await page.goto('/splash');
  const toggle = page.getByTestId('sound-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle.locator('.lu-sound-icon')).toHaveCount(1);
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

test('controls clear the safe areas and the logo stays above the button', async ({ page }) => {
  await page.goto('/splash');
  await page.evaluate(() => {
    const { style } = document.documentElement;
    style.setProperty('--ion-safe-area-top', '59px');
    style.setProperty('--ion-safe-area-bottom', '34px');
  });
  const splash = page.getByTestId('page-splash');
  const bounds = (await splash.boundingBox())!;
  const sound = (await splash.getByTestId('sound-toggle').boundingBox())!;
  const logo = (await splash.getByTestId('splash-logo').boundingBox())!;
  const cta = (await splash.getByRole('button', { name: en.splash.cta }).boundingBox())!;

  expect(sound.y).toBeGreaterThanOrEqual(bounds.y + 59);
  expect(logo.y).toBeGreaterThanOrEqual(bounds.y + 59);
  expect(logo.y + logo.height).toBeLessThan(cta.y);
  expect(cta.y + cta.height).toBeLessThanOrEqual(bounds.y + bounds.height - 34);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the logo glow holds still', async ({ page }) => {
    await page.goto('/splash');
    await expect(page.locator('.lu-splash-glow')).toHaveCSS('animation-name', 'none');
  });

  test('starfield stands still', async ({ page }) => {
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
