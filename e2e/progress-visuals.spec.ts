/* The body hologram and the trend switch behind "View more details" on Progress. */
import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, noHorizontalOverflow, test } from './fixtures';

const openDetails = async (page: import('@playwright/test').Page) => {
  await page.goto('/tabs/progress');
  await page.getByTestId('progress-more').click();
  await expect(page.getByTestId('body-comp')).toBeVisible();
};

for (const lang of ['en', 'ar'] as const)
  test.describe(lang, () => {
    test.use({ lang });

    test('the hologram tints each body part by its zone, with every value beside it', async ({ page, loginAs }) => {
      const s = { en, ar }[lang];
      await loginAs();
      await openDetails(page);
      const segs = page.getByTestId('segments');
      const figure = segs.getByTestId('segments-figure');
      await expect(figure).toBeVisible();
      await expect(figure).toHaveAttribute('data-silhouette', 'MALE');
      // Muscle view: 135% in the right arm is over the band.
      await expect(figure.locator('[data-part="rightArm"]')).toHaveAttribute('data-status', 'over');
      await expect(segs.getByTestId('seg-rightArm')).toContainText(s.bodyComp.zone.over);
      await segs.getByRole('radio', { name: s.bodyComp.fatView }).click();
      await expect(figure.locator('[data-part="trunk"]')).toHaveAttribute('data-status', 'under');
      await expect(segs.getByTestId('seg-trunk')).toContainText(s.bodyComp.zone.under);
      // Seen from behind in both languages: the left arm's label stays on the left of the figure.
      const left = (await segs.getByTestId('seg-leftArm').boundingBox())!;
      const fig = (await figure.boundingBox())!;
      expect(left.x + left.width).toBeLessThanOrEqual(fig.x + 1);
    });

    test('the female profile shows its silhouette in both scan views', async ({ page, loginAs }) => {
      const s = { en, ar }[lang];
      await loginAs('104');
      await openDetails(page);
      const segs = page.getByTestId('segments');
      const figure = segs.getByTestId('segments-figure');
      await expect(figure).toHaveAttribute('data-silhouette', 'FEMALE');
      await expect(figure.locator('[data-part]')).toHaveCount(5);
      await expect(segs.getByTestId('seg-leftArm')).toBeVisible();
      await segs.getByRole('radio', { name: s.bodyComp.fatView }).click();
      await expect(figure).toHaveAttribute('data-view', 'fat');
      await expect(figure).toHaveAttribute('data-silhouette', 'FEMALE');
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    test('each trend option shows its metric icon', async ({ page, loginAs }) => {
      await loginAs();
      await openDetails(page);
      const trend = page.getByTestId('trend');
      for (const k of ['weight', 'muscle', 'bodyFat', 'score'])
        await expect(trend.getByTestId(`trend-${k}`).locator('svg.lu-pixel-icon')).toBeVisible();
    });
  });

test('the hologram fits a 320 px screen', async ({ page, loginAs }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await loginAs();
  await openDetails(page);
  await page.getByTestId('segments').scrollIntoViewIfNeeded();
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test('with reduced motion the scan sweep is off', async ({ page, loginAs }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loginAs();
  await openDetails(page);
  await expect(page.getByTestId('segments').locator('.lu-holo-sweep')).toBeHidden();
});
