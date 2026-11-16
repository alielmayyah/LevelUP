import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES, type Locale } from './fixtures';

/** Mohamed (101): scan-based medals and verified workout milestones. */
const MOHAMED_UNLOCKED = [
  'fatBurner',
  'leanMachine',
  'shredded',
  'elitePhysique',
  'legendaryShape',
  'muscleStarter',
  'growingStrong',
  'firstPress',
  'ironChest',
  'heavyHitter',
  'powerLifter',
  'firstSquat',
  'ironLegs',
  'squatMaster',
  'titanLegs',
  ...['pushUps', 'deadlift', 'militaryPress', 'plank', 'bmi'].flatMap((category) =>
    ['bronze', 'silver', 'gold'].map((rarity) => `${category}-${rarity}`),
  ),
  'pullUps-bronze',
  'pullUps-silver',
];

const copyFor = (lang: Locale) => ({ en, ar })[lang].medals;

for (const lang of LOCALES) {
  for (const theme of THEMES) {
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme, reducedMotion: 'reduce' });

      test('Trophy Room shows medals from scans and verified lifts', async ({ page, loginAs }) => {
        const copy = copyFor(lang);
        // Celebrations already seen, so this test covers the collection itself.
        await page.addInitScript(
          (ids) => localStorage.setItem('CapacitorStorage.lu.medals.seen.1', JSON.stringify(ids)),
          MOHAMED_UNLOCKED,
        );
        await loginAs('101');
        await page.goto('/tabs/profile');
        await page.getByTestId('page-profile').getByRole('link', { name: { en, ar }[lang].profile.viewMedals }).click();

        const panel = page.getByTestId('page-medals');
        await expect(panel.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
        await expect(panel.getByTestId('medal-count')).toHaveText(
          copy.count.replace('{{unlocked}}', '32').replace('{{total}}', '50'),
        );
        await expect(panel.getByTestId('medal-xp')).toHaveText('4,650');
        await expect(page.getByTestId('medal-celebration')).toHaveCount(0);

        await expect(panel.locator('[data-testid^="medal-"][data-unlocked]')).toHaveCount(50);
        await expect(panel.locator('.lu-medal-card svg.lu-medal-art image')).toHaveCount(50);
        await expect(panel.locator('.lu-medal-art text')).toHaveCount(0);
        for (const id of MOHAMED_UNLOCKED)
          await expect(panel.getByTestId(`medal-${id}`)).toHaveAttribute('data-unlocked', 'true');
        await expect(panel.getByTestId('medal-benchLegend')).toHaveAttribute('data-unlocked', 'false');
        // The unverified 130 kg squat doesn't count.
        await expect(panel.getByTestId('medal-squatLegend')).toHaveAttribute('data-unlocked', 'false');

        // Filters.
        const filters = panel.getByRole('radiogroup', { name: copy.filter });
        await filters.getByRole('radio', { name: copy.category.bench }).click();
        await expect(panel.getByTestId('medal-section-bodyFat')).toHaveCount(0);
        await expect(panel.getByTestId('medal-section-bench')).toBeVisible();
        await expect(panel.getByTestId('medal-status-bench')).toContainText('82.5');

        // Locked medal details: honest progress toward 100 kg.
        await panel.getByTestId('medal-benchLegend').click();
        const detail = page.getByTestId('medal-detail');
        await expect(detail).toBeVisible();
        await expect(page.getByTestId('medal-detail-status')).toHaveText(copy.locked);
        await expect(page.getByTestId('medal-detail-progress')).toContainText('83%');
        await page.getByRole('button', { name: copy.detail.close }).click();
        await expect(detail).toHaveCount(0);

        // Unlocked medal details.
        await filters.getByRole('radio', { name: copy.all }).click();
        await panel.getByTestId('medal-legendaryShape').click();
        await expect(page.getByTestId('medal-detail-status')).toHaveText(copy.unlocked);
        await page.getByRole('button', { name: copy.detail.close }).click();
        await expect(page.getByTestId('medal-detail')).toHaveCount(0);

        await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        expect(await noHorizontalOverflow(page)).toBe(true);
        await panel.getByRole('button', { name: copy.back }).click();
        await expect(page).toHaveURL(/\/tabs\/profile$/);
      });

      test('Profile shows just the best medal per category with progress and details', async ({ page, loginAs }) => {
        const copy = copyFor(lang);
        await loginAs('101');
        await page.goto('/tabs/profile');
        const grid = page.getByTestId('profile-medal-grid');
        await expect(grid.getByRole('listitem')).toHaveCount(10);
        const plank = grid.getByTestId('profile-medal-plank');
        await expect(plank).toContainText(copy.rarity.gold);
        await expect(plank).toContainText('120');
        await expect(plank.locator('svg.lu-medal-art')).toHaveAttribute('data-rarity', 'gold');
        await expect(plank.getByTestId('profile-medal-progress')).toContainText('180');
        await expect(plank.getByTestId('profile-medal-progress')).toContainText('67%');
        await expect(page.getByTestId('profile-medal-count')).toContainText('10');
        expect(await noHorizontalOverflow(page)).toBe(true);
        await plank.click();
        const details = page.getByTestId('medal-detail');
        await expect(details.getByRole('heading', { level: 2 })).toContainText(copy.category.plank);
        await expect(page.getByTestId('medal-detail-status')).toHaveText(copy.unlocked);
        await page.getByRole('button', { name: copy.detail.close }).click();
        await expect(details).toHaveCount(0);
        await expect(page).toHaveURL(/\/tabs\/profile$/);
      });
    });
  }
}

test.describe('unlock celebration', () => {
  test.use({ reducedMotion: 'reduce' });

  test('celebrates new medals once, rarest first, then never again', async ({ page, loginAs }) => {
    const copy = copyFor('en');
    // Everything seen except the two muscle medals.
    await page.addInitScript(
      (ids) => {
        if (!localStorage.getItem('CapacitorStorage.lu.medals.seen.1'))
          localStorage.setItem('CapacitorStorage.lu.medals.seen.1', JSON.stringify(ids));
      },
      MOHAMED_UNLOCKED.filter((id) => id !== 'muscleStarter' && id !== 'growingStrong'),
    );
    await loginAs('101');
    await page.goto('/tabs/profile/medals');

    const celebration = page.getByTestId('medal-celebration');
    await expect(page.getByTestId('medal-celebration-title')).toHaveText(copy.medal.growingStrong.title);
    await expect(celebration).toContainText('+100 XP');
    await celebration.getByRole('button', { name: copy.celebrate.continue }).click();
    await expect(page.getByTestId('medal-celebration-title')).toHaveText(copy.medal.muscleStarter.title);
    await celebration.getByRole('button', { name: copy.celebrate.continue }).click();
    await expect(celebration).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId('medal-overview')).toBeVisible();
    await expect(page.getByTestId('medal-celebration')).toHaveCount(0);
  });
});

test.describe('no data', () => {
  test('Profile shows one locked milestone per category and no invented progress', async ({ page, loginAs }) => {
    await loginAs('102');
    await page.goto('/tabs/profile');
    await expect(page.getByTestId('profile-medal-count')).toHaveText('Medals earned in 0 of 10 categories');
    const grid = page.getByTestId('profile-medal-grid');
    await expect(grid.locator('[data-unlocked="false"]')).toHaveCount(10);
    await expect(grid.getByTestId('profile-medal-progress')).toHaveCount(0);
    const plank = grid.getByTestId('profile-medal-plank');
    await expect(plank).toContainText('30 sec');
    await plank.click();
    await expect(page.getByTestId('medal-detail-status')).toHaveText(en.medals.locked);
  });

  test('a new member sees every medal locked with what is needed, and no fake progress', async ({ page, loginAs }) => {
    const copy = copyFor('en');
    await loginAs('102');
    await page.goto('/tabs/profile/medals');
    const panel = page.getByTestId('page-medals');
    await expect(panel.getByTestId('medal-count')).toHaveText(
      copy.count.replace('{{unlocked}}', '0').replace('{{total}}', '50'),
    );
    await expect(panel.getByTestId('medal-status-bodyFat')).toHaveText(copy.unavailable.noScans);
    await expect(panel.getByTestId('medal-status-squat')).toHaveText(copy.unavailable.noLifts);
    await expect(panel.locator('.lu-medal-card [role="progressbar"]')).toHaveCount(0);
    await expect(page.getByTestId('medal-celebration')).toHaveCount(0);
  });
});
