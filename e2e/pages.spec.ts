/* Progress, Goals, Leaderboard, and Profile behavior against the mock API. */
import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, test } from './fixtures';

const tab = (name: string) => `[data-testid="page-${name}"]`;

test.describe('Progress', () => {
  test("Sam's scan and charts; tapping a point shows its values", async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/progress');
    const p = page.locator(tab('progress'));
    await expect(p.getByTestId('metric-weight')).toContainText('82.6 kg');
    await expect(p.getByTestId('chart-composition')).toBeVisible();
    await p.getByTestId('chart-composition-point-5').click();
    await expect(p.getByTestId('chart-composition-tip')).toContainText('82.6');
    await p.getByRole('button', { name: en.progress.metric.weight, exact: true }).click();
    await expect(p.getByRole('button', { name: en.progress.metric.weight, exact: true })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('Omar: second-scan message, no FitScore chart', async ({ page, loginAs }) => {
    await loginAs('103');
    await page.goto('/tabs/progress');
    await expect(page.getByText(en.progress.secondScan)).toBeVisible();
    await expect(page.getByTestId('fitscore-chart')).toHaveCount(0);
  });
});

test.describe('Goals', () => {
  test('every goal is on one page, with the journey on top', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/goals');
    const g = page.locator(tab('goals'));
    await expect(g.getByTestId('journey')).toContainText(`2/4 ${en.goals.done}`);
    await expect(g.getByTestId('section-active').getByTestId('goal')).toHaveCount(1);
    await expect(g.getByTestId('section-upcoming').getByTestId('goal')).toContainText(en.goals.upcomingNote);
    await expect(g.getByTestId('section-completed').getByTestId('goal')).toHaveCount(2);
    // Sections in order: in progress, up next, completed.
    const order = await g.locator('[data-testid^="section-"]').evaluateAll((els) => els.map((e) => e.dataset.testid));
    expect(order).toEqual(['section-active', 'section-upcoming', 'section-completed']);
    // A goal's details open on tap.
    const first = g.getByTestId('section-active').getByRole('button');
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(g.getByText(en.goals.due.replace(' {{date}}', ''), { exact: false }).first()).toBeVisible();
  });
});

test.describe('Leaderboard', () => {
  test('highlights Sam and remembers the board across a reload', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/leaderboard');
    const lb = page.locator(tab('leaderboard'));
    await expect(lb.getByTestId('my-row')).toBeInViewport();
    await lb.getByTestId('board-muscle').click();
    await expect(lb.getByTestId('board-muscle')).toHaveAttribute('aria-selected', 'true');
    await page.reload();
    await expect(page.locator(tab('leaderboard')).getByTestId('board-muscle')).toHaveAttribute('aria-selected', 'true');
  });

  test('Lina joins from the banner', async ({ page, loginAs }) => {
    await loginAs('102');
    await page.goto('/tabs/leaderboard');
    await page.getByTestId('join-banner').getByRole('button', { name: en.leaderboard.join }).click();
    await expect(page.getByTestId('join-banner')).toHaveCount(0);
    await expect(page.getByTestId('no-scan-note')).toBeVisible();
  });
});

test.describe('Profile', () => {
  test('turning off Show FitScore hides it on Home and Progress without a reload', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/home');
    await expect(page.getByTestId('fitscore-card')).toBeVisible();
    const bar = page.getByRole('navigation', { name: en.tabs.navLabel });
    await bar.getByRole('tab', { name: en.tabs.short.profile, exact: true }).click();
    await page.getByTestId('setting-show-fitscore').click();
    await expect(page.getByTestId('setting-show-fitscore')).toHaveAttribute('aria-checked', 'false');
    await bar.getByRole('tab', { name: en.tabs.short.home, exact: true }).click();
    await expect(page.locator(tab('home')).getByTestId('fitscore-card')).toHaveCount(0);
    await bar.getByRole('tab', { name: en.tabs.short.progress, exact: true }).click();
    await expect(page.locator(tab('progress')).getByTestId('chart-composition')).toBeVisible();
    await expect(page.locator(tab('progress')).getByTestId('fitscore-chart')).toHaveCount(0);
  });

  test('turning off the leaderboard setting removes Sam from the boards', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile');
    await page.getByTestId('setting-leaderboard').click();
    await expect(page.getByTestId('setting-leaderboard')).toHaveAttribute('aria-checked', 'false');
    await page
      .getByRole('navigation', { name: en.tabs.navLabel })
      .getByRole('tab', { name: en.tabs.short.leaderboard, exact: true })
      .click();
    await expect(page.getByTestId('join-banner')).toBeVisible();
    await expect(page.getByTestId('my-row')).toHaveCount(0);
  });

  test('language and theme switch the whole app at once', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile');
    await page.getByTestId('setting-language').getByRole('radio', { name: 'عربي' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ar.tabs.profile);
    await page.getByTestId('setting-theme').getByRole('radio', { name: ar.theme.dark }).click();
    await expect(page.locator('html')).toHaveClass(/ion-palette-dark/);
  });

  test('cancelling sign out keeps the member signed in', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile');
    await page.getByRole('button', { name: en.profile.signOut }).click();
    await page.getByRole('dialog').getByRole('button', { name: en.profile.cancel }).click();
    await expect(page).toHaveURL(/\/tabs\/profile$/);
  });
});
