import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { COMMUNITY, expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test("Mohamed's home shows greeting, date, FitScore, rank, and tiles", async ({ page, loginAs }) => {
        const s = strings[lang].home;
        await loginAs();
        await page.goto('/tabs/home');
        const home = page.getByTestId('page-home');
        await expect(home.getByTestId('greeting')).toContainText('Mohamed');
        await expect(home.getByTestId('today')).not.toBeEmpty();
        await expect(home.getByTestId('fitscore-value')).toHaveText('91');
        await expect(home.getByText(s.tier.elite)).toBeVisible();
        if (!COMMUNITY) await expect(home.getByTestId('rank-card')).toHaveCount(0);
        else {
          await expect(home.getByTestId('rank-number')).toContainText('#1');
          const trophy = home.getByTestId('rank-trophy');
          await expect(trophy).toBeVisible();
          const { stroke, gold } = await trophy.evaluate((tile) => {
            const cup = tile.querySelector('svg')!;
            const sample = document.createElement('span');
            sample.style.color = 'var(--lu-gold)';
            tile.append(sample);
            const gold = getComputedStyle(sample).color;
            sample.remove();
            return { stroke: getComputedStyle(cup).stroke, gold };
          });
          expect(stroke).toBe(gold);
        }
        await expect(home.getByTestId('tile-body-fat')).toContainText('1.1%');
        await expect(home.getByTestId('tile-muscle')).toContainText(`0.9 ${strings[lang].units.kg}`);
        await expect(home.getByTestId('tile-bmi')).toContainText(strings[lang].home.wins.bmi);
        for (const metric of ['body-fat', 'muscle', 'bmi']) {
          await expect(home.getByTestId(`tile-${metric}`).locator('svg').first()).toBeVisible();
        }
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
  await loginAs('102');
  await page.goto('/tabs/home');
  await expect(page.getByText(en.home.fitScore.empty)).toBeVisible();
  if (COMMUNITY) await expect(page.getByText(en.home.rank.join)).toBeVisible();
  await expect(page.getByText(en.home.fitScore.emptyNext)).toBeVisible();
  await expect(page.getByTestId('wins-empty')).toHaveText(en.home.wins.none);
  await expect(page.getByTestId('tile-body-fat')).toHaveCount(0);
  await expect(page.getByTestId('page-body')).not.toContainText('—');
  await expect(page.getByTestId('bell-dot')).toHaveCount(0);
  await page.getByTestId('bell').click();
  await expect(page.getByText(en.home.notifications.empty)).toBeVisible();
});

test('the rank card opens the leaderboard', async ({ page, loginAs }) => {
  test.skip(!COMMUNITY, 'Community is switched off (VITE_COMMUNITY)');
  await loginAs();
  await page.goto('/tabs/home');
  await page.getByTestId('rank-card').click();
  await expect(page).toHaveURL(/\/tabs\/community\/leaderboard$/);
});

test('the profile picture on Home opens Profile', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  await page.getByRole('link', { name: en.home.openProfile }).click();
  await expect(page).toHaveURL(/\/tabs\/profile$/);
});

test('the header clears the notch and the last tile clears the tab bar', async ({ page, loginAs }) => {
  await loginAs();
  await page.goto('/tabs/home');
  await page.evaluate(() => document.documentElement.style.setProperty('--ion-safe-area-top', '59px'));
  const bell = (await page.getByTestId('bell').boundingBox())!;
  expect(bell.y).toBeGreaterThanOrEqual(59);
  const tile = page.getByTestId('tile-bmi');
  await expect(tile).toBeVisible();
  await page
    .getByTestId('page-home')
    .locator('ion-content')
    .evaluate((el) => (el as HTMLElement & { scrollToBottom: (ms: number) => Promise<void> }).scrollToBottom(0));
  const t = (await tile.boundingBox())!;
  const bar = (await page.getByRole('navigation', { name: en.tabs.navLabel }).boundingBox())!;
  expect(t.y + t.height).toBeLessThanOrEqual(bar.y);
});

test('with no goal, the mission card opens New goal', async ({ page, loginAs }) => {
  await loginAs('102');
  await page.goto('/tabs/home');
  await page.getByRole('button', { name: new RegExp(en.home.mission.empty) }).click();
  await expect(page).toHaveURL(/\/tabs\/goals\/new$/);
});

for (const lang of LOCALES)
  test.describe(lang, () => {
    test.use({ lang });

    test('the FitScore info sheet explains the score and its tiers', async ({ page, loginAs }) => {
      const s = strings[lang].home;
      await loginAs();
      await page.goto('/tabs/home');
      await page.getByRole('button', { name: s.fitScore.about }).click();
      const sheet = page.getByTestId('fitscore-info');
      await expect(sheet.getByRole('heading', { name: s.fitScoreInfo.title })).toBeVisible();
      await expect(sheet.getByTestId('fitscore-tiers').getByRole('listitem')).toHaveCount(5);
      await expect(sheet.getByText(s.tier.gettingStarted)).toBeVisible();
      await expect(sheet.getByText(s.fitScoreInfo.privacy)).toBeVisible();
      expect(await noHorizontalOverflow(page)).toBe(true);
      await page.keyboard.press('Escape');
      await expect(sheet.getByRole('heading', { name: s.fitScoreInfo.title })).toHaveCount(0);
    });
  });
