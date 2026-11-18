/* The body-parts list, the plan, and the trend switch behind "See full scan" on Progress. */
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

    test('body parts read as a list: each part on a Low / Healthy / High track', async ({ page, loginAs }) => {
      const s = { en, ar }[lang];
      await loginAs();
      await openDetails(page);
      const segs = page.getByTestId('segments');
      // Muscle view: 135% in the right arm is over the band.
      await expect(segs.getByTestId('seg-rightArm')).toHaveAttribute('data-status', 'over');
      await expect(segs.getByTestId('seg-rightArm').locator('.lu-status')).toHaveText(s.bodyComp.zone.over);
      await segs.getByRole('radio', { name: s.bodyComp.fatView }).click();
      await expect(segs.getByTestId('seg-trunk')).toHaveAttribute('data-status', 'under');
      await expect(segs.getByTestId('seg-trunk').locator('.lu-status')).toHaveText(s.bodyComp.zone.under);
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    test('a member sees all five body parts in both views', async ({ page, loginAs }) => {
      const s = { en, ar }[lang];
      await loginAs('101');
      await openDetails(page);
      const segs = page.getByTestId('segments');
      await expect(segs.locator('[data-testid^="seg-"][data-status]')).toHaveCount(5);
      await segs.getByRole('radio', { name: s.bodyComp.fatView }).click();
      await expect(segs.locator('[data-testid^="seg-"][data-status]')).toHaveCount(5);
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
      for (const k of ['weight', 'muscle', 'bodyFat'])
        await expect(trend.getByTestId(`trend-${k}`).locator('svg.lu-icon')).toBeVisible();
    });

    test('the plan says what to do, and Home shows its first step', async ({ page, loginAs }) => {
      const s = { en, ar }[lang];
      await loginAs();
      await page.goto('/tabs/progress');
      const plan = page.getByTestId('action-plan');
      await expect(plan.getByRole('heading', { name: s.plan.title })).toBeVisible();
      await expect(plan.getByTestId('advice-fatLow')).toContainText(s.plan.item.fatLow.title);
      await page.getByTestId('tab-home').click();
      const teaser = page.getByTestId('plan-teaser');
      await expect(teaser.getByTestId('plan-teaser-top')).toContainText(s.plan.item.fatLow.title);
      await teaser.click();
      await expect(page).toHaveURL(/\/tabs\/progress$/);
    });
  });

test('the body parts fit a 320 px screen', async ({ page, loginAs }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await loginAs();
  await openDetails(page);
  await page.getByTestId('segments').scrollIntoViewIfNeeded();
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test('the plan opens with what the change means', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/progress');
  const card = page.getByTestId('scan-insight');
  // Demo member 101 gained muscle and lost fat since the scan before.
  await expect(card).toHaveAttribute('data-kind', 'recomp');
  await expect(card.getByTestId('insight-headline')).toHaveText(en.progress.insight.kind.recomp.title);
});

test('a single scan has a plan but no change to explain yet', async ({ page, loginAs }) => {
  await loginAs('103');
  await page.goto('/tabs/progress');
  await expect(page.getByTestId('latest-scan')).toBeVisible();
  await expect(page.getByTestId('action-plan')).toBeVisible();
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
