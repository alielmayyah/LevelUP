import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { COMMUNITY, expect, LOCALES, noHorizontalOverflow, test, THEMES } from './fixtures';

test.skip(!COMMUNITY, 'Community is switched off (VITE_COMMUNITY)');

const strings = { en, ar };

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('tapping a gym member opens a card that leads to their stats', async ({ page, loginAs }) => {
        const copy = strings[lang];
        await loginAs();
        await page.goto('/tabs/community');
        const gym = page.getByTestId('community-gym');
        const first = gym.getByTestId('community-member').first();
        const name = (await first.getAttribute('aria-label'))!;
        await first.click();
        const card = gym.getByTestId('community-card');
        await expect(card).toContainText(name);
        await expect(card.getByTestId('community-card-info')).toContainText('#');
        await card.getByRole('link', { name: copy.community.profile }).click();

        await expect(page).toHaveURL(/\/tabs\/community\/member\/\d+$/);
        const member = page.getByTestId('page-member');
        await expect(member.getByTestId('member-name')).toHaveText(name);
        await expect(member.getByTestId('member-age')).toContainText(/\d+/);
        await expect(member.getByTestId('member-height')).toContainText(/\d+/);
        for (const board of ['score', 'muscle', 'bodyFat'])
          await expect(member.getByTestId(`member-rank-${board}`)).toContainText('#');
        await expect(member.getByTestId('member-medal-grid').getByRole('listitem')).toHaveCount(10);
        expect(await noHorizontalOverflow(page)).toBe(true);
        await page.getByRole('button', { name: copy.common.back, exact: true }).click();
        await expect(page).toHaveURL(/\/tabs\/community$/);
      });
    });
