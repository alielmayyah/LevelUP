/* Progress, Goals, and Profile behavior against the mock API. */
import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, test } from './fixtures';

const tab = (name: string) => `[data-testid="page-${name}"]`;

test.describe('Progress', () => {
  test("Mohamed's key numbers, their change, and one trend at a time", async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/progress');
    const p = page.locator(tab('progress'));
    await expect(p.getByTestId('metric-weight')).toContainText(/80\.0\s?kg/);
    await expect(p.getByTestId('change-muscle')).toContainText('0.9 kg');
    await expect(p.getByTestId('change-muscle').locator('[data-icon="trendUp"]')).toBeVisible();
    // Simple by default: the other six, the compare picker and the trends sit behind See full scan.
    await expect(p.getByTestId('trend-headline')).toHaveCount(0);
    await expect(p.getByTestId('more-metrics')).toHaveCount(0);
    await expect(p.getByTestId('compare-open')).toHaveCount(0);
    await expect(p.getByTestId('change-caption')).toHaveText(en.progress.comparedPrevious);
    await p.getByTestId('progress-more').click();
    await expect(p.getByTestId('progress-more')).toHaveAttribute('aria-expanded', 'true');
    await expect(p.getByTestId('trend-headline')).toContainText(/80\.0\s?kg/);
    // All nine measurements show; the six smaller cards keep just a name, value and (belly fat) a verdict.
    await expect(p.getByTestId('visceral-verdict')).toHaveText(en.progress.visceralLevel.ok);
    await expect(p.getByTestId('metric-visceral')).toContainText(en.progress.metric.visceral);
    await expect(p.getByTestId('metric-visceral')).not.toContainText(en.progress.info.visceral.what);
    // Each measurement explains itself in a pop-up.
    await p.getByTestId('info-muscle').click();
    const info = page.getByRole('dialog', { name: en.progress.metric.muscle });
    await expect(info).toContainText(en.progress.info.muscle.tip);
    await page.keyboard.press('Escape');
    await expect(info).toBeHidden();
    // An earlier scan is one tap away.
    await p.getByRole('button', { name: en.progress.olderScan }).click();
    await expect(p.getByTestId('metric-weight')).toContainText(/79\.3\s?kg/);
    await p.getByRole('button', { name: en.progress.newerScan }).click();
    // View all scans: pick any scan from the full list.
    await p.getByTestId('view-all-scans').click();
    const sheet = page.getByTestId('scan-history');
    // As many scans as fit the screen; the first scan is the last row of the last page.
    await expect(sheet.getByTestId('scan-row').first()).toBeVisible();
    if (await sheet.getByTestId('pager').count()) {
      await sheet.getByRole('button', { name: en.pager.nextPage }).click();
      await expect(sheet.getByTestId('pager')).toContainText('2');
    }
    await sheet.getByTestId('scan-row').last().click();
    await expect(p.getByTestId('scan-date')).toContainText('1');
    await expect(p.getByTestId('change-weight')).toHaveText(en.progress.firstScan);
    // One line at a time; tapping a point shows its value.
    await expect(p.getByTestId('chart-trend')).toBeVisible();
    await p.getByTestId('chart-trend-point-5').click();
    await expect(p.getByTestId('chart-trend-tip')).toContainText('80.0');
    await p.getByTestId('trend').getByRole('radio', { name: en.progress.metric.muscle }).click();
    await p.getByTestId('chart-trend-point-5').click();
    await expect(p.getByTestId('chart-trend-tip')).toContainText('41.3');
  });

  for (const lang of ['en', 'ar'] as const)
    test.describe(lang, () => {
      test.use({ lang });

      test('body composition bars, body parts, and comparing with any scan', async ({ page, loginAs }) => {
        const s = { en, ar }[lang];
        await loginAs();
        await page.goto('/tabs/progress');
        await page.getByTestId('progress-more').click();
        const bc = page.getByTestId('body-comp');
        await expect(bc.getByTestId('bar-weight')).toHaveAttribute('data-status', 'normal');
        await expect(bc.getByTestId('bar-pbf')).toHaveAttribute('data-status', 'under');
        await expect(bc.getByTestId('bar-pbf').locator('.lu-status')).toHaveText(s.bodyComp.zone.under);
        await expect(bc.getByTestId('bar-smm-delta')).toContainText('0.9');
        // Body parts: a left/right list, muscle by default, fat on tap.
        const segs = bc.getByTestId('segments');
        await expect(segs.getByTestId('segments-lean')).toHaveAttribute('aria-checked', 'true');
        await expect(segs.getByTestId('seg-trunk')).toBeVisible();
        await segs.getByRole('radio', { name: s.bodyComp.fatView }).click();
        await expect(segs.getByTestId('seg-trunk')).toHaveAttribute('data-status', 'under');
        await expect(segs.getByTestId('seg-trunk').locator('.lu-status')).toHaveText(s.bodyComp.zone.under);
        // Arms come before legs, left before right.
        const leftArm = (await segs.getByTestId('seg-leftArm').boundingBox())!;
        const rightArm = (await segs.getByTestId('seg-rightArm').boundingBox())!;
        const leftLeg = (await segs.getByTestId('seg-leftLeg').boundingBox())!;
        expect(rightArm.y).toBeGreaterThan(leftArm.y);
        expect(leftLeg.y).toBeGreaterThan(rightArm.y);
        // Compare with the first scan: 36.4 → 41.3 kg of muscle.
        await page.getByTestId('compare-open').click();
        const picker = page.getByTestId('compare-picker');
        await expect(picker.getByTestId('scan-row').first()).toBeDisabled();
        await expect(picker.getByTestId('scan-row').first()).toBeVisible();
        if (await picker.getByTestId('pager').count())
          await picker.getByRole('button', { name: s.pager.nextPage }).click();
        await picker.getByTestId('scan-row').last().click();
        await expect(page.getByTestId('change-muscle')).toContainText('4.9');
        await expect(bc.getByTestId('bar-smm-delta')).toContainText('4.9');
        // Or compare with nothing.
        await page.getByTestId('compare-open').click();
        await page.getByTestId('compare-none').click();
        await expect(page.getByTestId('change-caption')).toContainText(s.progress.compareOffShort);
        await expect(bc.getByTestId('bar-smm-delta')).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      });
    });

  test('Omar: one scan, so changes and trends wait for the second', async ({ page, loginAs }) => {
    await loginAs('103');
    await page.goto('/tabs/progress');
    await page.getByTestId('progress-more').click();
    await expect(page.getByText(en.progress.secondScan)).toBeVisible();
    await expect(page.getByTestId('change-muscle')).toHaveText(en.progress.changeLater);
    await expect(page.getByTestId('trend-score')).toHaveCount(0);
  });
});

test.describe('Goals', () => {
  test('every goal is on one page', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/goals');
    const g = page.locator(tab('goals'));
    await expect(g.getByTestId('section-active').getByTestId('goal')).toHaveCount(2);
    await expect(g.getByTestId('section-completed').getByTestId('goal')).toHaveCount(2);
    // Two sections: in progress, then completed. No time factor, so nothing is up next.
    const order = await g.locator('[data-testid^="section-"]').evaluateAll((els) => els.map((e) => e.dataset.testid));
    expect(order).toEqual(['section-active', 'section-completed']);
    // Every detail is on the card: start, now, target. No dates, no coach note.
    await expect(g.getByTestId('section-active').getByTestId('goal-stats').first()).toContainText(en.goals.target);
    await expect(g.getByTestId('section-completed').getByTestId('goal').first()).toContainText(en.goals.reached);
    await expect(g.getByText('Keep protein high on training days.')).toHaveCount(0);
  });

  test('a member creates their own goal and it goes live at once', async ({ page, loginAs }) => {
    await loginAs('103');
    await page.goto('/tabs/goals');
    const g = page.locator(tab('goals'));
    // One primary button on the empty screen: the empty state's.
    await expect(g.getByTestId('goal-new')).toHaveCount(0);
    await g.getByTestId('goal-new-empty').click();

    const n = page.locator(tab('new-goal'));
    await expect(n.getByRole('heading', { level: 1 })).toHaveText(en.newGoal.title);
    await n.getByTestId('goal-type-MUSCLE_KG').click();
    await n.getByTestId('goal-more').click();
    await expect(n.getByTestId('goal-name')).toHaveText('Gain 2.5 kg of muscle');
    // No due date to pick.
    await expect(n.getByText(/^Due /)).toHaveCount(0);
    await n.getByTestId('goal-create').click();

    await expect(page).toHaveURL(/\/tabs\/goals$/);
    await expect(page.getByTestId('toast')).toHaveText(en.goals.created);
    await expect(g.getByTestId('section-active').getByTestId('goal')).toContainText('Gain 2.5 kg of muscle');
    // It is also today's mission on Home.
    await page.goto('/tabs/home');
    await expect(page.getByTestId('mission-card')).toContainText('Gain 2.5 kg of muscle');
  });

  test('the new goal page has a way back and keyboard choices', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/goals');
    await page.locator(tab('goals')).getByTestId('goal-new').click();
    const n = page.locator(tab('new-goal'));
    await expect(n.getByTestId('goal-starts')).toHaveText(en.newGoal.startsNow);
    await n.getByTestId('goal-type-BODY_FAT_KG').focus();
    await page.keyboard.press('ArrowRight');
    await expect(n.getByTestId('goal-type-MUSCLE_KG')).toBeFocused();
    await expect(n.getByTestId('goal-type-MUSCLE_KG')).toHaveAttribute('aria-checked', 'true');
    await n.getByTestId('new-goal-back').click();
    await expect(page).toHaveURL(/\/tabs\/goals$/);
  });
});

test.describe('Profile', () => {
  test('language and theme switch the whole app at once', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/settings');
    await page.getByTestId('setting-language').getByRole('radio', { name: 'عربي' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ar.profile.settings);
    await page.getByTestId('setting-theme').getByRole('radio', { name: ar.theme.dark }).click();
    await expect(page.locator('html')).toHaveClass(/ion-palette-dark/);
  });

  test('cancelling sign out keeps the member signed in', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/settings');
    await page.getByRole('button', { name: en.profile.signOut }).click();
    await expect(page.getByRole('dialog')).toContainText(en.profile.signOutNote);
    await page.getByRole('dialog').getByRole('button', { name: en.profile.cancel }).click();
    await expect(page).toHaveURL(/\/tabs\/profile\/settings$/);
  });
});

test.describe('Character', () => {
  test.use({ reducedMotion: 'reduce' });
  const AVATAR_KEY = 'CapacitorStorage.lu.mock.avatar.101';

  for (const lang of ['en', 'ar'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test.describe(`${lang}/${theme}`, () => {
        test.use({ lang, theme });

        test('shows the face on Home and Profile, and saves portrait styles and colors', async ({ page, loginAs }) => {
          const copy = lang === 'ar' ? ar : en;
          await loginAs();
          await page.addInitScript((key) => {
            if (!localStorage.getItem(key)) {
              localStorage.setItem(
                key,
                JSON.stringify({
                  schemaVersion: 2,
                  colors: { skin: 'medium', hair: 'chestnut', top: 'forest', bottom: 'black', shoes: 'purple' },
                }),
              );
            }
          }, AVATAR_KEY);
          await page.goto('/tabs/home');
          const homeAvatar = page.getByTestId('home-avatar');
          await expect(homeAvatar.locator('svg')).toHaveAttribute('data-figure', 'hd-portrait');
          await homeAvatar.click();
          await expect(page.getByTestId('profile-avatar')).toHaveAttribute('data-crop', 'portrait');
          await page.getByTestId('customize-character').click();
          const editor = page.locator(tab('character'));
          const preview = editor.getByTestId('character-preview');
          await expect(preview).toHaveAttribute('data-figure', 'hd-portrait');
          await expect(preview.locator('image')).toHaveCount(2);
          await expect(editor.getByRole('tab')).toHaveCount(4);

          const pick = async (part: keyof typeof copy.avatar.tab, color: keyof typeof copy.avatar.color) => {
            await editor.getByRole('tab', { name: copy.avatar.tab[part], exact: true }).click();
            await editor
              .getByRole('radiogroup', {
                name: part === 'hair' ? copy.avatar.hairColor : copy.avatar.tab[part],
                exact: true,
              })
              .getByRole('radio', { name: copy.avatar.color[color], exact: true })
              .click();
          };
          await pick('skin', 'tan');
          await pick('hair', 'blonde');
          await editor
            .getByRole('radiogroup', { name: copy.avatar.look })
            .getByRole('radio', { name: copy.avatar.style.fade })
            .click();
          await pick('eyes', 'green');
          await editor.getByRole('tab', { name: copy.avatar.tab.outfit }).click();
          await editor
            .getByRole('radiogroup', { name: copy.avatar.outfitStyle })
            .getByRole('radio', { name: copy.avatar.style.hoodie })
            .click();
          await editor
            .getByRole('radiogroup', { name: copy.avatar.outfitColor })
            .getByRole('radio', { name: copy.avatar.color.navy })
            .click();
          await expect(preview.locator('[data-layer="skin"]')).toHaveAttribute('data-color', 'tan');
          await expect(preview.locator('[data-layer="hair"]')).toHaveAttribute('data-color', 'blonde');
          await expect(preview.locator('[data-look]')).toHaveAttribute('data-look', 'fade');
          await expect(preview.locator('[data-outfit]')).toHaveAttribute('data-outfit', 'hoodie');
          await expect(preview.locator('[data-layer="eyes"]')).toHaveAttribute('data-color', 'green');
          const fabricAlpha = await preview.locator('[data-layer="outfit"]').evaluate(async (layer) => {
            const image = new Image();
            image.src = layer.getAttribute('href')!;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d')!;
            context.drawImage(image, 0, 0);
            return context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height * 0.96), 1, 1).data[3];
          });
          expect(fabricAlpha).toBeGreaterThan(128);
          await expect(editor.getByTestId('character-status')).toHaveText(copy.avatar.saved);

          await page.reload();
          await expect(preview.locator('[data-layer="hair"]')).toHaveAttribute('data-color', 'blonde');
          await expect(preview.locator('[data-layer="skin"]')).toHaveAttribute('data-color', 'tan');
          const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), AVATAR_KEY);
          expect(saved.colors).toEqual({ skin: 'tan', hair: 'blonde', top: 'navy', bottom: 'black', shoes: 'purple' });
          expect(saved.portrait).toEqual({ look: 'fade', outfit: 'hoodie', eyes: 'green' });
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        });
      });
    }
  }

  for (const [lang, theme] of [
    ['en', 'light'],
    ['ar', 'dark'],
  ] as const) {
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      test('a female member can save her hairstyle, hijab color, and outfit across Home and Profile', async ({
        page,
        loginAs,
      }) => {
        const { avatar: copy } = { en, ar }[lang];
        await loginAs('102');
        await page.goto('/tabs/home');
        const home = page.getByTestId('home-avatar');
        await expect(home.locator('svg')).toHaveAttribute('data-portrait-sex', 'FEMALE');
        await home.click();
        await expect(page.getByTestId('profile-avatar')).toHaveAttribute('data-portrait-sex', 'FEMALE');
        await page.getByTestId('customize-character').click();
        const editor = page.locator(tab('character'));
        const preview = editor.getByTestId('character-preview');
        await editor.getByRole('tab', { name: copy.tab.hair, exact: true }).click();
        const looks = editor.getByRole('radiogroup', { name: copy.hairstyle, exact: true });
        await expect(looks.getByRole('radio')).toHaveCount(4);
        await looks.getByRole('radio', { name: copy.style.bob }).click();
        await expect(preview.locator('[data-layer="head"]')).toHaveAttribute('href', /girl-bob-head\.webp$/);
        const hairColor = await preview.locator('[data-hair]').getAttribute('data-hair');
        await looks.getByRole('radio', { name: copy.style.hijab }).click();
        await editor
          .getByRole('radiogroup', { name: copy.hijabColor, exact: true })
          .getByRole('radio', { name: copy.color.ivory })
          .click();
        await expect(preview.locator('[data-layer="hijab"]')).toHaveAttribute('data-color', 'ivory');
        await expect(preview.locator('[data-hair]')).toHaveAttribute('data-hair', hairColor!);
        await editor.getByRole('tab', { name: copy.tab.outfit, exact: true }).click();
        await editor
          .getByRole('radiogroup', { name: copy.outfitStyle, exact: true })
          .getByRole('radio', { name: copy.style.jacket })
          .click();
        await expect(preview.locator('[data-layer="outfit"]')).toHaveAttribute('href', /girl-jacket\.webp$/);
        await expect(editor.getByTestId('character-status')).toHaveText(copy.saved);
        await page.reload();
        await expect(preview.locator('[data-look]')).toHaveAttribute('data-look', 'hijab');
        await expect(preview.locator('[data-layer="hijab"]')).toHaveAttribute('data-color', 'ivory');
        await expect(preview.locator('[data-outfit]')).toHaveAttribute('data-outfit', 'jacket');
        await editor.getByTestId('character-back').click();
        await expect(page.getByTestId('profile-avatar').locator('[data-look]')).toHaveAttribute('data-look', 'hijab');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    });
  }

  test('arrow keys move through the parts and a color group', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.locator(tab('character'));
    const skinTab = editor.getByRole('tab', { name: en.avatar.tab.skin, exact: true });
    await skinTab.focus();
    await page.keyboard.press('ArrowRight');
    const hairTab = editor.getByRole('tab', { name: en.avatar.tab.hair, exact: true });
    await expect(hairTab).toBeFocused();
    await expect(hairTab).toHaveAttribute('aria-selected', 'true');
    const hair = editor.getByRole('radiogroup', { name: en.avatar.hairColor, exact: true });
    const checked = hair.getByRole('radio', { checked: true });
    const before = await checked.getAttribute('aria-label');
    await checked.focus();
    await page.keyboard.press('ArrowRight');
    await expect(hair.getByRole('radio', { checked: true })).not.toHaveAttribute('aria-label', before!);
    await expect(hair.getByRole('radio', { checked: true })).toBeFocused();
  });

  test('a change saves on its own, even when leaving right away', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.locator(tab('character'));
    await editor.getByTestId('character-random').click();
    // Leave before the half-second autosave: the pending save is still sent, no dialog.
    await editor.getByTestId('character-back').click();
    await expect(page).toHaveURL(/\/tabs\/profile$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), AVATAR_KEY)).not.toBeNull();
  });

  test('a failed autosave keeps the edit available to retry or discard', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.locator(tab('character'));
    const preview = editor.getByTestId('character-preview');
    await expect(preview).toBeVisible();
    const failNextWrite = () =>
      page.evaluate((key) => {
        const write = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, value) {
          if (k === key) {
            Storage.prototype.setItem = write;
            throw new Error('Storage temporarily unavailable');
          }
          write.call(this, k, value);
        };
      }, AVATAR_KEY);
    const hair = (color: keyof typeof en.avatar.color) =>
      editor
        .getByRole('radiogroup', { name: en.avatar.hairColor, exact: true })
        .getByRole('radio', { name: en.avatar.color[color], exact: true });
    await editor.getByRole('tab', { name: en.avatar.tab.hair, exact: true }).click();
    await failNextWrite();
    await hair('grey').click();
    await expect(editor.getByRole('alert')).toHaveText(en.avatar.saveFailed);
    await expect(preview.locator('[data-layer="hair"]')).toHaveAttribute('data-color', 'grey');
    expect(await page.evaluate((key) => localStorage.getItem(key), AVATAR_KEY)).toBeNull();
    await editor.getByRole('button', { name: en.common.retry, exact: true }).click();
    await expect(editor.getByTestId('character-status')).toHaveText(en.avatar.saved);
    await failNextWrite();
    await hair('blonde').click();
    await expect(editor.getByRole('alert')).toHaveText(en.avatar.saveFailed);
    await editor.getByRole('button', { name: en.avatar.discardUnsaved, exact: true }).click();
    await expect(preview.locator('[data-layer="hair"]')).toHaveAttribute('data-color', 'grey');
    await editor.getByTestId('character-back').click();
    await expect(page.getByTestId('profile-avatar').locator('[data-layer="hair"]')).toHaveAttribute(
      'data-color',
      'grey',
    );
  });
});
