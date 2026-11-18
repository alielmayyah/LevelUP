import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test("Karim's home leads with his level, the verdict and the road", async ({ page, loginAs }) => {
        const s = strings[lang].journey;
        await loginAs('104');
        await page.goto('/tabs/home');
        const home = page.getByTestId('page-home');
        await expect(home.getByTestId('greeting')).toContainText('Karim');
        await expect(home.getByTestId('today')).not.toBeEmpty();
        await expect(home.getByRole('img', { name: s.levelAria.replace('{{level}}', '3') })).toBeVisible();
        await expect(home.getByTestId('verdict')).toHaveText(s.verdict.recomposition);
        await expect(home.getByTestId('road-stop')).toHaveCount(3);
        await expect(home.getByTestId('change-muscleKg')).toHaveAttribute('data-verdict', 'better');
        await expect(home.locator('button[data-variant="primary"]')).toHaveCount(1);
        expect(await noHorizontalOverflow(page)).toBe(true);
      });

      test('the road runs from the reading start: the first scan is on the right in Arabic', async ({
        page,
        loginAs,
      }) => {
        await loginAs('104');
        await page.goto('/tabs/home');
        const stops = page.getByTestId('road-stop');
        await expect(stops).toHaveCount(3);
        const first = (await stops.first().boundingBox())!;
        const latest = (await stops.last().boundingBox())!;
        if (lang === 'ar') expect(first.x).toBeGreaterThan(latest.x);
        else expect(first.x).toBeLessThan(latest.x);
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
  await expect(page.getByTestId('home-empty')).toContainText(en.journey.empty.title);
  await expect(page.getByTestId('home-empty')).toContainText(en.journey.empty.message);
  await expect(page.getByTestId('home-goal')).toHaveCount(0);
  await expect(page.getByTestId('page-body')).not.toContainText('—');
  await expect(page.getByTestId('bell-dot')).toHaveCount(0);
  await page.getByTestId('bell').click();
  await expect(page.getByText(en.home.notifications.empty)).toBeVisible();
});

test('the initials on Home open Account', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  await page.getByRole('link', { name: en.journey.openAccount }).click();
  await expect(page).toHaveURL(/\/tabs\/account$/);
});

test('the header clears the notch and the last card clears the tab bar', async ({ page, loginAs }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loginAs();
  await page.goto('/tabs/home');
  await page.evaluate(() => document.documentElement.style.setProperty('--ion-safe-area-top', '59px'));
  const bell = (await page.getByTestId('bell').boundingBox())!;
  expect(bell.y).toBeGreaterThanOrEqual(59);
  const card = page.getByTestId('home-goal');
  await expect(card).toBeVisible();
  await page
    .getByTestId('page-home')
    .locator('ion-content')
    .evaluate((el) => (el as HTMLElement & { scrollToBottom: (ms: number) => Promise<void> }).scrollToBottom(0));
  const t = (await card.boundingBox())!;
  const bar = (await page.getByRole('navigation', { name: en.tabs.navLabel }).boundingBox())!;
  expect(t.y + t.height).toBeLessThanOrEqual(bar.y);
});

test('with no goal, the goal card opens New goal', async ({ page, loginAs }) => {
  await loginAs('104');
  await page.goto('/tabs/home');
  await page.getByRole('link', { name: en.journey.goal.set }).click();
  await expect(page).toHaveURL(/\/tabs\/account\/goals\/new$/);
});
