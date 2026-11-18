/* The body hologram and the trend switch behind "See full scan" on Progress. */
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

    test('See full scan is one disclosure, remembered after a reload', async ({ page, loginAs }) => {
      const s = { en, ar }[lang];
      await loginAs();
      await page.goto('/tabs/progress');
      const toggle = page.getByTestId('progress-more');
      await expect(toggle).toHaveText(s.progress.moreDetails);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByTestId('more-metrics')).toHaveCount(0);
      await toggle.click();
      await expect(toggle).toHaveText(s.progress.lessDetails);
      await expect(page.getByTestId('more-metrics')).toBeVisible();
      await expect(page.getByTestId('compare-open')).toHaveText(s.progress.compareChange);
      await page.reload();
      await expect(page.getByTestId('progress-more')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByTestId('more-metrics')).toBeVisible();
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    test('each trend option shows its metric icon', async ({ page, loginAs }) => {
      await loginAs();
      await openDetails(page);
      const trend = page.getByTestId('trend');
      for (const k of ['weight', 'muscle', 'bodyFat', 'score'])
        await expect(trend.getByTestId(`trend-${k}`).locator('svg.lu-icon')).toBeVisible();
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

test('the scan says what the change means and what to do next', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/progress');
  const card = page.getByTestId('scan-insight');
  // Demo member 101 gained muscle and lost fat since the scan before.
  await expect(card).toHaveAttribute('data-kind', 'recomp');
  await expect(card.getByTestId('insight-headline')).toHaveText(en.progress.insight.kind.recomp.title);
  await expect(card.getByTestId('insight-next')).toContainText(en.progress.insight.kind.recomp.next);
});

test('a single scan has nothing to explain yet', async ({ page, loginAs }) => {
  await loginAs('103');
  await page.goto('/tabs/progress');
  await expect(page.getByTestId('latest-scan')).toBeVisible();
  await expect(page.getByTestId('scan-insight')).toHaveCount(0);
});

test('trend cards show a sparkline and open their chart', async ({ page, loginAs }) => {
  await loginAs();
  await openDetails(page);
  const trend = page.getByTestId('trend');
  await expect(trend.getByTestId('trend-muscle').locator('svg.lu-spark')).toBeVisible();
  await trend.getByTestId('trend-muscle').click();
  await expect(trend.getByTestId('trend-muscle')).toHaveAttribute('aria-checked', 'true');
  await expect(trend.getByTestId('trend-headline')).toContainText('41.3');
});

test('how you compare ranks body fat against people the same age', async ({ page, loginAs }) => {
  await loginAs();
  await openDetails(page);
  const card = page.getByTestId('how-you-compare');
  await expect(card.getByTestId('fat-percentile')).toContainText(/Leaner than .*\d+%.* of men your age/);
  for (const k of ['muscle', 'bmi', 'belly']) await expect(card.getByTestId(`compare-${k}`)).toBeVisible();
});
