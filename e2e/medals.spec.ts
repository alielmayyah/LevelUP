import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, LOCALES, noHorizontalOverflow, test, THEMES, type Locale } from './fixtures';

/** Mohamed (101): medals come from scans only (muscle gained, body fat, BMI). */
const MOHAMED_UNLOCKED = [
  'fatBurner',
  'leanMachine',
  'shredded',
  'elitePhysique',
  'legendaryShape',
  'muscleStarter',
  'growingStrong',
  'bmi-bronze',
  'bmi-silver',
  'bmi-gold',
];

const copyFor = (lang: Locale) => ({ en, ar })[lang].medals;

for (const lang of LOCALES) {
  for (const theme of THEMES) {
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme, reducedMotion: 'reduce' });

      test('Trophy Room shows the scan medals: muscle, body fat, and BMI', async ({ page, loginAs }) => {
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
          copy.count.replace('{{unlocked}}', '10').replace('{{total}}', '15'),
        );
        // The overview is the count and one bar: no percent line, no stats row.
        await expect(panel.getByTestId('medal-bar')).toHaveAttribute('aria-valuenow', '67');
        await expect(panel.getByTestId('medal-overview').locator('dl')).toHaveCount(0);
        await expect(page.getByTestId('medal-celebration')).toHaveCount(0);

        await expect(panel.locator('[data-testid^="medal-"][data-unlocked]')).toHaveCount(15);
        // No strength (lift or workout) medals.
        await expect(panel.locator('[data-testid^="medal-section-"]')).toHaveCount(3);
        // Vector badges: every medal draws its category's line icon.
        await expect(panel.locator('.lu-medal-card svg.lu-medal-art .lu-medal-glyph')).toHaveCount(15);
        await expect(panel.locator('.lu-medal-art text')).toHaveCount(0);
        for (const id of MOHAMED_UNLOCKED)
          await expect(panel.getByTestId(`medal-${id}`)).toHaveAttribute('data-unlocked', 'true');
        await expect(panel.getByTestId('medal-muscleBuilder')).toHaveAttribute('data-unlocked', 'false');

        // Filters: All plus the three categories.
        const filters = panel.getByRole('radiogroup', { name: copy.filter });
        await expect(filters.getByRole('radio')).toHaveCount(4);
        await filters.getByRole('radio', { name: copy.category.muscle }).click();
        await expect(panel.getByTestId('medal-section-bodyFat')).toHaveCount(0);
        await expect(panel.getByTestId('medal-section-muscle')).toBeVisible();
        // With data, the section is just its medals; the precise value waits in the sheet.
        await expect(panel.getByTestId('medal-status-muscle')).toHaveCount(0);
        await expect(panel.getByTestId('medal-muscleBuilder').locator('.lu-rarity')).toHaveCount(0);

        // Locked medal details: honest progress toward +5 kg, and the gain so far for detail lovers.
        await panel.getByTestId('medal-muscleBuilder').click();
        const detail = page.getByTestId('medal-detail');
        await expect(detail).toBeVisible();
        await expect(page.getByTestId('medal-detail-status')).toHaveText(copy.locked);
        await expect(page.getByTestId('medal-detail-progress')).toContainText('98%');
        await expect(page.getByTestId('medal-detail-records')).toContainText('4.9');
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
        await expect(grid.getByRole('listitem')).toHaveCount(3);
        // Five months in the healthy BMI range: Gold (3 months) earned, Epic (6 months) next.
        const bmi = grid.getByTestId('profile-medal-bmi');
        await expect(bmi).toContainText(copy.rarity.gold);
        await expect(bmi.locator('svg.lu-medal-art')).toHaveAttribute('data-rarity', 'gold');
        await expect(bmi.getByTestId('profile-medal-progress')).toContainText('6');
        await expect(bmi.getByTestId('profile-medal-progress')).toContainText('83%');
        await expect(page.getByTestId('profile-medal-count')).toContainText('3');
        expect(await noHorizontalOverflow(page)).toBe(true);
        await bmi.click();
        const details = page.getByTestId('medal-detail');
        await expect(details.getByRole('heading', { level: 2 })).toContainText(copy.category.bmi);
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
    await expect(celebration).not.toContainText('XP');
    // One popup for both: the rarest medal, with a count of the rest.
    await expect(page.getByTestId('medal-celebration-more')).toBeVisible();
    await celebration.getByRole('button', { name: copy.celebrate.seeAll }).click();
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
    await expect(page.getByTestId('profile-medal-count')).toHaveText('Medals earned in 0 of 3 categories');
    const grid = page.getByTestId('profile-medal-grid');
    await expect(grid.locator('[data-unlocked="false"]')).toHaveCount(3);
    await expect(grid.getByTestId('profile-medal-progress')).toHaveCount(0);
    // Lina is a woman, so her first body fat medal is below 38%.
    const bodyFat = grid.getByTestId('profile-medal-bodyFat');
    await expect(bodyFat).toContainText('38%');
    await bodyFat.click();
    await expect(page.getByTestId('medal-detail-status')).toHaveText(en.medals.locked);
  });

  test('a new member sees every medal locked with what is needed, and no fake progress', async ({ page, loginAs }) => {
    const copy = copyFor('en');
    await loginAs('102');
    await page.goto('/tabs/profile/medals');
    const panel = page.getByTestId('page-medals');
    await expect(panel.getByTestId('medal-count')).toHaveText(
      copy.count.replace('{{unlocked}}', '0').replace('{{total}}', '15'),
    );
    await expect(panel.getByTestId('medal-status-bodyFat')).toHaveText(copy.unavailable.noScans);
    await expect(panel.getByTestId('medal-status-muscle')).toHaveText(copy.unavailable.noScans);
    await expect(panel.locator('.lu-medal-card [role="progressbar"]')).toHaveCount(0);
    await expect(page.getByTestId('medal-celebration')).toHaveCount(0);
  });
});

test('locked medals show a lock badge instead of a Locked label', async ({ page, loginAs }) => {
  await loginAs('102');
  await page.goto('/tabs/profile');
  const muscle = page.getByTestId('profile-medal-grid').getByTestId('profile-medal-muscle');
  await expect(muscle.getByTestId('medal-lock')).toBeVisible();
  // The word stays for screen readers only.
  await expect(muscle.getByText(en.medals.locked)).toHaveClass(/sr-only/);
});
