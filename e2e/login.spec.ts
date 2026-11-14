import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('a valid Fit ID signs in and opens Home', async ({ page }) => {
        const s = strings[lang].login;
        await page.goto('/login');
        const login = page.getByTestId('page-login');
        await expect(login.getByRole('heading', { name: s.welcome.replace('{{name}}', 'LevelUP') })).toBeVisible();
        await expect(login.getByText(s.help)).toBeVisible();
        const field = login.getByLabel(s.fitId);
        await expect(field).toHaveAttribute('dir', 'ltr');
        const submit = login.getByRole('button', { name: s.submit });
        await expect(submit).toBeDisabled();
        await expect(submit).toBeInViewport();
        expect(await noHorizontalOverflow(page)).toBe(true);

        await field.fill('101');
        await submit.click();
        await expect(page).toHaveURL(/\/tabs\/home$/);
      });

      test('an unknown Fit ID shows "not found" and keeps the value', async ({ page }) => {
        const s = strings[lang].login;
        await page.goto('/login');
        const field = page.getByLabel(s.fitId);
        await field.fill('999');
        await page.getByRole('button', { name: s.submit }).click();
        await expect(page.getByRole('alert')).toHaveText(s.notFound);
        await expect(field).toHaveValue('999');
        await expect(page).toHaveURL(/\/login$/);
      });
    });

test('typing keeps digits only, at most 8', async ({ page }) => {
  await page.goto('/login');
  const field = page.getByLabel(en.login.fitId);
  await field.pressSequentially('12ab345678901');
  await expect(field).toHaveValue('12345678');
});

test('six quick wrong tries show "too many tries"', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(en.login.fitId).fill('999');
  const submit = page.getByRole('button', { name: en.login.submit });
  for (let i = 0; i < 5; i++) {
    await submit.click();
    await expect(page.getByRole('alert')).toHaveText(en.login.notFound);
  }
  await submit.click();
  await expect(page.getByRole('alert')).toHaveText(en.login.tooMany);
});

test('the session survives a reload', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(en.login.fitId).fill('101');
  await page.getByRole('button', { name: en.login.submit }).click();
  await expect(page).toHaveURL(/\/tabs\/home$/);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/tabs\/home$/);
});

test('the language button switches to Arabic and back', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: en.language.switchToAr }).click();
  await expect(page.getByLabel(ar.login.fitId)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const toggle = page.getByTestId('language-toggle');
  const width = page.viewportSize()!.width;
  expect((await toggle.boundingBox())!.x).toBeLessThan(width / 2);

  await page.getByRole('button', { name: ar.language.switchToEn }).click();
  await expect(page.getByLabel(en.login.fitId)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('splash leads to login by itself, and Back on login returns to the splash', async ({ page }) => {
  await page.goto('/splash');
  await expect(page.getByLabel(en.login.fitId)).toBeVisible({ timeout: 5000 });
  // iPhones have no back button: Login carries its own.
  await page.getByRole('button', { name: en.login.back }).click();
  await expect(page).toHaveURL(/\/splash$/);
});

test('content clears the notch and the home indicator', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => {
    const { style } = document.documentElement;
    style.setProperty('--ion-safe-area-top', '59px');
    style.setProperty('--ion-safe-area-bottom', '34px');
  });
  const bounds = (await page.getByTestId('page-login').boundingBox())!;
  const sound = (await page.getByTestId('sound-toggle').boundingBox())!;
  expect(sound.y).toBeGreaterThanOrEqual(bounds.y + 59);
  const submit = (await page.getByRole('button', { name: en.login.submit }).boundingBox())!;
  expect(submit.y + submit.height).toBeLessThanOrEqual(bounds.y + bounds.height - 34);
});

test.describe('landscape phone', () => {
  test.use({ viewport: { width: 667, height: 375 } });

  test('Sign in is visible without scrolling', async ({ page }) => {
    await page.goto('/login');
    // 0.99 rather than 1: WebKit reports a sub-pixel sliver from the centered column.
    await expect(page.getByRole('button', { name: en.login.submit })).toBeInViewport({ ratio: 0.99 });
    expect(await noHorizontalOverflow(page)).toBe(true);
  });
});
