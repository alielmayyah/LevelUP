/*
 * Mobile interaction checks (ionic-mobile-experience skill): navigation dead
 * ends, Android back, tab re-tap, keyboard hints, and pressed feedback.
 *
 * Browser limits, stated plainly: there is no real Android back button here,
 * so the test dispatches Ionic's ionBackButton event the way Ionic does on a
 * device. That proves our handlers; the native wiring (@capacitor/app) needs a
 * real phone.
 */
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, test } from './fixtures';

/** The bits of Ionic's ion-content element these tests use. */
type IonContentEl = HTMLElement & {
  scrollToPoint: (x: number, y: number, ms: number) => Promise<void>;
  getScrollElement: () => Promise<HTMLElement>;
};

/** Fires Ionic's hardware-back event and runs the highest-priority handler, as Ionic does. */
const pressHardwareBack = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const handlers: [number, () => void][] = [];
    document.dispatchEvent(
      new CustomEvent('ionBackButton', { detail: { register: (p: number, h: () => void) => handlers.push([p, h]) } }),
    );
    handlers.sort((a, b) => b[0] - a[0]);
    handlers[0]?.[1]();
    return handlers.map(([p]) => p);
  });

test.describe('navigation has no dead ends', () => {
  test('an unknown tab address lands on Home', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/nope');
    await expect(page).toHaveURL(/\/tabs\/home$/);
    await expect(page.getByTestId('greeting')).toBeVisible();
  });

  test('any other unknown address goes to the start', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page).toHaveURL(/\/splash$/);
    // During the route change Ionic keeps the leaving page in the DOM (hidden), so look for the visible one.
    await expect(page.getByTestId('page-splash').filter({ visible: true })).toBeVisible();
  });
});

test('Android back closes the sign-out dialog and stays on Profile', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/profile');
  await page.getByRole('button', { name: en.profile.signOut }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const priorities = await pressHardwareBack(page);
  expect(priorities[0]).toBeGreaterThanOrEqual(100); // the dialog outranks navigation
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page).toHaveURL(/\/tabs\/profile$/);
});

test.describe('scrolling on a phone-height screen', () => {
  // Short enough that the Progress page always scrolls, on every device project.
  test.use({ viewport: { width: 390, height: 640 } });

  test('re-tapping the active tab scrolls it back to the top', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/progress');
    const content = page.getByTestId('page-progress').locator('ion-content');
    // Wait for the lazy charts so the page is at full height before scrolling.
    await expect(page.getByTestId('chart-composition')).toBeVisible();
    await content.evaluate((el) => (el as IonContentEl).scrollToPoint(0, 300, 0));
    const scrollTop = () => content.evaluate(async (el) => (await (el as IonContentEl).getScrollElement()).scrollTop);
    await expect.poll(scrollTop).toBeGreaterThan(100);
    await page.getByTestId('tab-progress').click();
    await expect.poll(scrollTop).toBeLessThan(5);
  });

  test('switching tabs keeps each tab where the member left it', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/progress');
    const content = page.getByTestId('page-progress').locator('ion-content');
    const scrollTop = () => content.evaluate(async (el) => (await (el as IonContentEl).getScrollElement()).scrollTop);
    // The charts load after the page; wait so the page is at its full height before scrolling.
    await expect(page.getByTestId('chart-composition')).toBeVisible();
    await content.evaluate((el) => (el as IonContentEl).scrollToPoint(0, 250, 0));
    await expect.poll(scrollTop).toBeGreaterThan(200);
    await page.getByTestId('tab-goals').click();
    await expect(page).toHaveURL(/\/tabs\/goals$/);
    await page.getByTestId('tab-progress').click();
    await expect(page).toHaveURL(/\/tabs\/progress$/);
    // A page still hidden mid-transition reports 0, so wait until it is shown again.
    await expect(page.getByTestId('page-progress')).not.toHaveClass(/ion-page-hidden/);
    await expect.poll(scrollTop).toBeGreaterThan(200);
  });
});

test('the Fit ID keyboard is numeric with a Go key, and Enter signs in', async ({ page }) => {
  await page.goto('/login');
  const field = page.getByLabel(en.login.fitId);
  await expect(field).toHaveAttribute('inputmode', 'numeric');
  await expect(field).toHaveAttribute('enterkeyhint', 'go');
  await field.fill('101');
  await field.press('Enter');
  await expect(page).toHaveURL(/\/tabs\/home$/);
});

test('controls give pressed feedback and do not zoom on a quick double tap', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  const bell = page.getByTestId('bell');
  await expect(bell).toHaveCSS('touch-action', 'manipulation');
  const box = (await bell.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(bell).not.toHaveCSS('transform', 'none');
  await page.mouse.up();
  await expect(page.getByTestId('notifications')).toBeVisible();
});
