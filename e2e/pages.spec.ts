/* Progress, Goals, Leaderboard, and Profile behavior against the mock API. */
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
    await expect(p.getByTestId('change-muscle')).toContainText('▲ 0.9 kg');
    // Trends sit behind View more details.
    await expect(p.getByTestId('trend-headline')).toHaveCount(0);
    await p.getByTestId('progress-more').click();
    await expect(p.getByTestId('trend-headline')).toContainText(/80\.0\s?kg/);
    // All nine measurements show; the six smaller cards keep just a name and value.
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
    // Five to a page: the first scan is on page 2.
    await expect(sheet.getByTestId('scan-row')).toHaveCount(5);
    await sheet.getByRole('button', { name: en.leaderboard.nextPage }).click();
    await expect(sheet.getByTestId('pager')).toContainText('2');
    await sheet.getByTestId('scan-row').first().click();
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
        await expect(bc.getByTestId('bar-weight')).toContainText(s.bodyComp.zone.normal);
        await expect(bc.getByTestId('bar-pbf')).toContainText(s.bodyComp.zone.under);
        await expect(bc.getByTestId('bar-smm-delta')).toContainText('0.9');
        // The figure: muscle by default, fat on tap.
        const segs = bc.getByTestId('segments');
        await expect(segs.getByTestId('seg-trunk')).toBeVisible();
        await segs.getByRole('radio', { name: s.bodyComp.fatView }).click();
        await expect(segs.getByTestId('seg-trunk')).toContainText(s.bodyComp.zone.under);
        // Compare with the first scan: 36.4 → 41.3 kg of muscle.
        await page.getByTestId('compare-open').click();
        const picker = page.getByTestId('compare-picker');
        await expect(picker.getByTestId('scan-row').first()).toBeDisabled();
        await picker.getByRole('button', { name: s.leaderboard.nextPage }).click();
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

  test('a member creates their own goal and it goes live at once', async ({ page, loginAs }) => {
    await loginAs('103');
    await page.goto('/tabs/goals');
    const g = page.locator(tab('goals'));
    await g.getByTestId('goal-new-empty').click();

    const n = page.locator(tab('new-goal'));
    await expect(n.getByRole('heading', { level: 1 })).toHaveText(en.newGoal.title);
    await n.getByTestId('goal-type-MUSCLE_KG').click();
    await n.getByTestId('goal-more').click();
    await expect(n.getByTestId('goal-name')).toHaveText('Gain 2.5 kg of muscle');
    // No due date to pick.
    await expect(n.getByText(en.goals.due.replace(' {{date}}', ''), { exact: false })).toHaveCount(0);
    await n.getByTestId('goal-create').click();

    await expect(page).toHaveURL(/\/tabs\/goals$/);
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
    await expect(n.getByTestId('goal-starts')).toHaveText(en.newGoal.startsNext);
    await n.getByTestId('goal-type-BODY_FAT_KG').focus();
    await page.keyboard.press('ArrowRight');
    await expect(n.getByTestId('goal-type-MUSCLE_KG')).toBeFocused();
    await expect(n.getByTestId('goal-type-MUSCLE_KG')).toHaveAttribute('aria-checked', 'true');
    await n.getByTestId('new-goal-back').click();
    await expect(page).toHaveURL(/\/tabs\/goals$/);
  });
});

test.describe('Leaderboard', () => {
  test('highlights Mohamed and remembers the board across a reload', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/leaderboard');
    const lb = page.locator(tab('leaderboard'));
    await expect(lb.getByTestId('my-row')).toBeInViewport();
    await lb.getByTestId('board-muscle').click();
    await expect(lb.getByTestId('board-muscle')).toHaveAttribute('aria-selected', 'true');
    await page.reload();
    await expect(page.locator(tab('leaderboard')).getByTestId('board-muscle')).toHaveAttribute('aria-selected', 'true');
  });

  test('the top three stand on the podium, everyone else is listed from 4th with a character', async ({
    page,
    loginAs,
  }) => {
    await loginAs();
    await page.goto('/tabs/leaderboard');
    const lb = page.locator(tab('leaderboard'));
    const podium = lb.getByRole('region', { name: en.leaderboard.podium });
    await expect(podium.getByRole('listitem')).toHaveCount(3);
    await expect(podium.locator('svg[data-crop="full"]')).toHaveCount(3);
    const list = lb.getByRole('list', { name: en.leaderboard.board.score });
    await expect(list).toHaveAttribute('start', '4');
    // Mohamed is #1 among the men, so he stands on the podium, not in the list.
    await expect(podium.getByTestId('my-row')).toBeVisible();
    await expect(list.getByTestId('my-row')).toHaveCount(0);
    await expect(list.getByTestId('row').first().locator('svg').first()).toBeVisible();
    // 16 men after the podium need two pages: the pager appears and turns the page.
    const pager = lb.getByTestId('pager');
    await expect(pager).toContainText('1');
    await pager.getByRole('button', { name: en.leaderboard.nextPage }).click();
    await expect(list).toHaveAttribute('start', '14');
    await expect(list.getByTestId('my-row')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
    await page.locator(tab('progress')).getByTestId('progress-more').click();
    await expect(page.locator(tab('progress')).getByTestId('chart-trend')).toBeVisible();
    await expect(page.locator(tab('progress')).getByTestId('trend-score')).toHaveCount(0);
  });

  test('turning off the leaderboard setting removes Mohamed from the boards', async ({ page, loginAs }) => {
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

test.describe('Character', () => {
  for (const lang of ['en', 'ar'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test.describe(`${lang}/${theme}`, () => {
        test.use({ lang, theme });
        test('previews and saves styles and colors', async ({ page, loginAs }) => {
          const copy = lang === 'ar' ? ar : en;
          await loginAs();
          await page.goto('/tabs/profile');
          await page.getByRole('link', { name: copy.profile.customize }).click();
          const editor = page.locator(tab('character'));
          const preview = editor.getByTestId('character-preview');
          const selectTab = (key: keyof typeof copy.avatar.tab) =>
            editor.getByRole('tab', { name: copy.avatar.tab[key], exact: true }).click();
          const color = (part: keyof typeof copy.avatar.part, name: keyof typeof copy.avatar.color) =>
            editor
              .getByRole('radiogroup', { name: copy.avatar.part[part], exact: true })
              .getByRole('radio', { name: copy.avatar.color[name], exact: true });

          await expect(editor.getByRole('heading', { level: 1 })).toHaveText(copy.avatar.title);
          await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
          if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/ion-palette-dark/);
          await expect(editor.getByRole('tab', { name: copy.avatar.tab.outfits })).toHaveAttribute(
            'aria-selected',
            'true',
          );
          const outfits = editor.getByRole('group', { name: copy.avatar.outfitTitle });
          const summer = outfits.getByRole('button', { name: copy.avatar.outfit['summer-fit'] });
          await summer.click();
          await expect(preview.locator('[data-style-layer="pants"]')).toHaveAttribute('data-variant', 'shorts');
          await expect(preview.locator('[data-style-layer="shoes"]')).toHaveAttribute('data-variant', 'slip-ons');
          const darkHoodie = outfits.getByRole('button', { name: copy.avatar.outfit['dark-hoodie'] });
          await darkHoodie.click();
          await expect(darkHoodie).toHaveAttribute('aria-pressed', 'true');
          await expect(summer).toHaveAttribute('aria-pressed', 'false');
          await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-variant', 'hoodie');
          await expect(preview.locator('[data-art-detail="stitched-hoodie"]')).toHaveCount(1);
          await expect(preview.locator('[data-style-layer="pants"]')).toHaveAttribute('data-variant', 'joggers');
          await expect(preview.locator('image')).toHaveCount(0);
          const choices = [
            ['hair', 'locs'],
            ['body', 'broad'],
            ['top', 'hoodie'],
            ['shoes', 'high-tops'],
            ['pants', 'cargo'],
            ['beard', 'goatee'],
            ['socks', 'striped-socks'],
          ] as const;
          for (const [part, id] of choices) {
            await selectTab(part);
            const option = editor
              .getByRole('radiogroup', { name: copy.avatar.styleLabel[part] })
              .getByRole('radio', { name: copy.avatar.style[id] });
            await option.click();
            await expect(option).toHaveAttribute('aria-checked', 'true');
            await expect(preview.locator(`[data-style-layer="${part}"]`)).toHaveAttribute('data-variant', id);
            if (part === 'hair') await color('hair', 'silver').click();
            if (part === 'body') await color('skin', 'rich-brown').click();
            if (part === 'top') await color('tank', 'teal').click();
            if (part === 'pants') await color('shorts', 'olive').click();
            if (part === 'beard') await color('beard', 'auburn').click();
            if (part === 'socks') {
              const sock = preview.locator('[data-paint="sock-fabric"]').first();
              const before = await sock.getAttribute('fill');
              await color('socks', 'violet').click();
              await expect(sock).not.toHaveAttribute('fill', before!);
            }
          }
          await selectTab('face');
          await color('eyes', 'brown').click();
          const eyes = preview.locator('[data-feature="eyes"] path');
          await expect(eyes).toHaveCount(2);
          expect(await eyes.first().getAttribute('fill')).not.toBe(await eyes.last().getAttribute('fill'));
          await expect(preview.locator('[data-feature="smile"]')).toHaveCount(1);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          // No Save button: every change saves on its own.
          await expect(editor.getByTestId('character-status')).toHaveText(copy.avatar.saved);
          await editor.getByTestId('character-back').click();
          await expect(page).toHaveURL(/\/tabs\/profile$/);
          await expect(page.getByTestId('profile-avatar').locator('[data-style-layer="hair"]')).toHaveAttribute(
            'data-variant',
            'locs',
          );

          await page.reload();
          await page.goto('/tabs/profile/character');
          for (const [part, id] of choices) {
            await expect(preview.locator(`[data-style-layer="${part}"]`)).toHaveAttribute('data-variant', id);
          }
          await selectTab('beard');
          await expect(color('beard', 'auburn')).toHaveAttribute('aria-checked', 'true');
          await selectTab('socks');
          await expect(color('socks', 'violet')).toHaveAttribute('aria-checked', 'true');
          await selectTab('hair');
          await expect(color('hair', 'silver')).toHaveAttribute('aria-checked', 'true');
        });
      });
    }
  }

  test('arrow keys move through a color group', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.locator(tab('character'));
    const faceTab = editor.getByRole('tab', { name: en.avatar.tab.face, exact: true });
    await faceTab.focus();
    await page.keyboard.press('ArrowLeft');
    const bodyTab = editor.getByRole('tab', { name: en.avatar.tab.body });
    await expect(bodyTab).toBeFocused();
    await expect(bodyTab).toHaveAttribute('aria-selected', 'true');
    const skin = editor.getByRole('radiogroup', { name: en.avatar.part.skin });
    const checked = skin.getByRole('radio', { checked: true });
    const before = await checked.getAttribute('aria-label');
    await checked.focus();
    await page.keyboard.press('ArrowRight');
    await expect(skin.getByRole('radio', { checked: true })).not.toHaveAttribute('aria-label', before!);
    await expect(skin.getByRole('radio', { checked: true })).toBeFocused();
  });

  test('a change saves on its own, even when leaving right away', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.locator(tab('character'));
    await expect(editor.getByTestId('character-save')).toHaveCount(0);
    await editor.getByTestId('character-random').click();
    // Leave before the half-second autosave: the pending save is still sent, no dialog.
    await editor.getByTestId('character-back').click();
    await expect(page).toHaveURL(/\/tabs\/profile$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('CapacitorStorage.lu.mock.avatar.101')))
      .not.toBeNull();
  });

  test('the editor works in Arabic without horizontal scroll', async ({ page, loginAs }) => {
    await loginAs();
    await page.addInitScript(() => localStorage.setItem('CapacitorStorage.lu.lang', 'ar'));
    await page.goto('/tabs/profile/character');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator(tab('character')).getByRole('heading', { level: 1 })).toHaveText(ar.avatar.title);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
