import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { COMMUNITY, expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

test.skip(!COMMUNITY, 'Community is switched off (VITE_COMMUNITY)');

const strings = { en, ar };
type ScrollableContent = HTMLElement & {
  scrollToBottom: (ms: number) => Promise<void>;
  getScrollElement: () => Promise<HTMLElement>;
};

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('Community shows gym members and opens rankings from the wall board', async ({ page, loginAs }) => {
        const copy = strings[lang];
        await loginAs();
        await page.goto('/tabs/community');
        const gym = page.getByTestId('community-gym');
        await expect(gym.getByTestId('community-self').locator('svg[data-crop="full"]')).toBeVisible();
        await expect(gym.getByTestId('community-member')).toHaveCount(18);
        await expect(gym.getByTestId('community-guest')).toHaveCount(5);
        await expect(page.getByRole('navigation', { name: copy.community.rooms })).toHaveCount(0);

        const bar = page.getByRole('navigation', { name: copy.tabs.navLabel });
        const gymBox = (await gym.boundingBox())!;
        const gap = (await bar.boundingBox())!.y - (gymBox.y + gymBox.height);
        expect(gap).toBeGreaterThanOrEqual(4);
        expect(gap).toBeLessThanOrEqual(24);
        await expect(gym.getByTestId('community-member').last()).toBeInViewport({ ratio: 1 });
        const [tileWidth, tileHeight] = await gym
          .getByTestId('community-floor')
          .evaluate((floor) =>
            getComputedStyle(floor).backgroundSize.split(',')[0].trim().split(/\s+/).map(parseFloat),
          );
        expect(tileWidth).toBeGreaterThan(0);
        expect(tileHeight).toBeCloseTo(tileWidth);

        const first = gym.getByTestId('community-member').first();
        const name = (await first.getAttribute('aria-label'))!;
        await first.click();
        await expect(first).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByTestId('page-community').getByRole('status')).toHaveText(name);
        const board = gym.getByTestId('community-wall-board');
        await expect(board).toBeInViewport({ ratio: 1 });
        const portraits = board.getByTestId('community-board-portrait');
        await expect(portraits.locator('svg[data-crop="portrait"]')).toHaveCount(3);
        await expect(portraits.first()).toHaveAttribute('title', 'Mohamed O.');
        expect((await board.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        expect(await noHorizontalOverflow(page)).toBe(true);
        await board.getByRole('link', { name: copy.community.leaderboards }).click();
        await expect(page).toHaveURL(/\/tabs\/community\/leaderboard$/);
        await expect(page.getByTestId('page-leaderboard').getByRole('heading', { level: 1 })).toHaveText(
          copy.tabs.leaderboard,
        );
        await page.getByRole('button', { name: copy.common.back, exact: true }).click();
        await expect(page).toHaveURL(/\/tabs\/community$/);
      });

      test('Profile shows member details and links to Settings', async ({ page, loginAs }) => {
        const copy = strings[lang];
        await loginAs();
        await page.goto('/tabs/profile');
        const profile = page.getByTestId('page-profile');
        await expect(profile.getByTestId('profile-avatar')).toHaveAttribute('data-crop', 'full');
        await expect(profile.getByTestId('profile-age')).toContainText(/\d+/);
        await expect(profile.getByTestId('profile-height')).toContainText('183');
        await expect(profile.getByTestId('profile-medal-grid').getByRole('listitem')).toHaveCount(10);
        await expect(profile.getByRole('link', { name: copy.profile.customize, exact: true })).toBeVisible();
        await expect(profile.getByRole('link', { name: copy.profile.viewMedals })).toBeVisible();
        expect(await noHorizontalOverflow(page)).toBe(true);
        await profile.getByRole('link', { name: copy.profile.settings, exact: true }).click();
        await expect(page).toHaveURL(/\/tabs\/profile\/settings$/);
        await expect(page.getByTestId('setting-language')).toBeVisible();
        await page.getByRole('button', { name: copy.common.back, exact: true }).click();
        await expect(page).toHaveURL(/\/tabs\/profile$/);
      });
    });

test('the framed leaderboard stays tappable while the gym scrolls in landscape', async ({ page, loginAs }) => {
  await page.setViewportSize({ width: 852, height: 393 });
  await loginAs();
  await page.goto('/tabs/community');
  const board = page.getByTestId('community-wall-board');
  await expect(board.getByTestId('community-board-portrait')).toHaveCount(3);

  const content = page.getByTestId('page-community').locator('ion-content');
  await content.evaluate((el) => (el as ScrollableContent).scrollToBottom(0));
  await expect
    .poll(() => content.evaluate(async (el) => (await (el as ScrollableContent).getScrollElement()).scrollTop))
    .toBeGreaterThan(100);
  await expect(board).toBeInViewport({ ratio: 1 });
  await board.getByRole('link', { name: en.community.leaderboards }).click({ position: { x: 6, y: 6 } });
  await expect(page).toHaveURL(/\/tabs\/community\/leaderboard$/);
});
