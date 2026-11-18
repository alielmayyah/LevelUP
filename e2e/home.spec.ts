import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test("Mohamed's home shows greeting, date, and FitScore", async ({ page, loginAs }) => {
        await loginAs();
        await page.goto('/tabs/home');
        const home = page.getByTestId('page-home');
        await expect(home.getByTestId('greeting')).toContainText('Mohamed');
        await expect(home.getByTestId('today')).not.toBeEmpty();
        await expect(home.getByTestId('fitscore-value')).toHaveText('91');
        expect(await noHorizontalOverflow(page)).toBe(true);
      });

      test('the bell opens notifications and Mark all read clears the dot', async ({ page, loginAs }) => {
        const s = strings[lang].home.notifications;
        await loginAs();
        await page.goto('/tabs/home');
        const bell = page.getByRole('button', { name: s.bellUnread.replace('{{n}}', '2') });
        await expect(page.getByTestId('bell-dot')).toBeVisible();
        await bell.click();
        const sheet = page.getByTestId('notifications');
        await expect(sheet.getByTestId('notification')).toHaveCount(4);
        await sheet.getByRole('button', { name: s.markAll }).click();
        await expect(page.getByTestId('bell-dot')).toHaveCount(0);
        await sheet.getByRole('button', { name: s.close }).click();
        await expect(page.getByRole('button', { name: s.bell, exact: true })).toBeVisible();
      });
    });

test('tapping an unread notification marks it read', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  await page.getByTestId('bell').click();
  const first = page.getByTestId('notification').first();
  await expect(first).toHaveClass(/is-unread/);
  await first.click();
  await expect(first).not.toHaveClass(/is-unread/);
  await expect(page.getByTestId('bell')).toHaveAttribute(
    'aria-label',
    en.home.notifications.bellUnread.replace('{{n}}', '1'),
  );
});

test('a new member sees empty states, not zeros', async ({ page, loginAs }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loginAs('102');
  await page.goto('/tabs/home');
  await expect(page.getByText(en.home.fitScore.empty)).toBeVisible();
  await expect(page.getByText(en.home.fitScore.emptyNext)).toBeVisible();
  await expect(page.getByTestId('page-body')).not.toContainText('—');
  await expect(page.getByTestId('bell-dot')).toHaveCount(0);
  await page.getByTestId('bell').click();
  await expect(page.getByText(en.home.notifications.empty)).toBeVisible();
});

test('the profile picture on Home opens Profile', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  await page.getByRole('link', { name: en.home.openProfile }).click();
  await expect(page).toHaveURL(/\/tabs\/profile$/);
});

test('the header clears the notch and the goal card clears the tab bar', async ({ page, loginAs }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loginAs();
  await page.goto('/tabs/home');
  await page.evaluate(() => document.documentElement.style.setProperty('--ion-safe-area-top', '59px'));
  const bell = (await page.getByTestId('bell').boundingBox())!;
  expect(bell.y).toBeGreaterThanOrEqual(59);
  const card = page.getByTestId('mission-card');
  await expect(card).toBeVisible();
  await page
    .getByTestId('page-home')
    .locator('ion-content')
    .evaluate((el) => (el as HTMLElement & { scrollToBottom: (ms: number) => Promise<void> }).scrollToBottom(0));
  const t = (await card.boundingBox())!;
  const bar = (await page.getByRole('navigation', { name: en.tabs.navLabel }).boundingBox())!;
  expect(t.y + t.height).toBeLessThanOrEqual(bar.y);
});

test('with no goal, the mission card opens New goal', async ({ page, loginAs }) => {
  await loginAs('102');
  await page.goto('/tabs/home');
  await page.getByRole('button', { name: new RegExp(en.home.mission.empty) }).click();
  await expect(page).toHaveURL(/\/tabs\/goals\/new$/);
});
