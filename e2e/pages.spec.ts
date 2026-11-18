/* Progress, Goals, Leaderboard, and Profile behavior against the mock API. */
import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { COMMUNITY, expect, test } from './fixtures';

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
      await sheet.getByRole('button', { name: en.leaderboard.nextPage }).click();
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

test.describe('Leaderboard', () => {
  test.skip(!COMMUNITY, 'Community is switched off (VITE_COMMUNITY)');
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

  test('a docked "you" bar shows the member’s rank while their row is off screen, and jumps to it', async ({
    page,
    loginAs,
  }) => {
    await loginAs('108');
    await page.setViewportSize({ width: 390, height: 560 });
    await page.goto('/tabs/leaderboard');
    const lb = page.locator(tab('leaderboard'));
    await expect(lb.getByTestId('my-row')).toBeAttached();
    await lb
      .locator('ion-content')
      .evaluate((c) => (c as HTMLElement & { scrollToTop: (ms: number) => Promise<void> }).scrollToTop(0));
    const dock = lb.getByTestId('my-rank-dock');
    await expect(dock).toBeVisible();
    await expect(dock).toContainText(en.leaderboard.you);
    await dock.click();
    await expect(lb.getByTestId('my-row')).toBeInViewport();
    await expect(dock).toHaveCount(0);
  });

  test('filters by age group from the funnel menu and remembers it across a reload', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/leaderboard');
    const lb = page.locator(tab('leaderboard'));
    const funnel = lb.getByTestId('age-filter-button');
    await expect(funnel).toHaveAttribute('data-active', 'false');

    await funnel.click();
    const menu = lb.getByRole('radiogroup', { name: en.leaderboard.age.label });
    await expect(menu.getByRole('radio', { name: en.leaderboard.age.all })).toHaveAttribute('aria-checked', 'true');
    // Mohamed is 23: his bracket carries the "your age group" mark.
    await expect(lb.getByTestId('age-under25').getByLabel(en.leaderboard.age.yours)).toBeVisible();
    await lb.getByTestId('age-under25').click();
    await expect(menu).toHaveCount(0);
    await expect(funnel).toHaveAttribute('data-active', 'true');
    await expect(lb.getByTestId('age-chip')).toContainText(en.leaderboard.age.under25);
    await expect(lb.getByTestId('my-row')).toBeVisible();

    await funnel.click();
    await lb.getByTestId('age-45plus').click();
    await expect(lb.getByTestId('other-age-note')).toHaveText(en.leaderboard.age.otherGroup);
    await expect(lb.getByTestId('my-row')).toHaveCount(0);
    await expect(lb.getByTestId('no-scan-note')).toHaveCount(0);

    // Arrow keys move through the brackets; Escape closes and returns focus to the funnel.
    await funnel.click();
    await expect(lb.getByTestId('age-45plus')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(lb.getByTestId('age-35to44')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(funnel).toBeFocused();

    await page.reload();
    await expect(page.locator(tab('leaderboard')).getByTestId('age-chip')).toContainText(en.leaderboard.age['35to44']);
    await page.locator(tab('leaderboard')).getByTestId('age-chip').click();
    await expect(page.locator(tab('leaderboard')).getByTestId('age-chip')).toHaveCount(0);
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
    // Scrolling past the podium can reveal the pinned rank card. Go to the
    // end of the content, where the pager clears that card.
    await pager.scrollIntoViewIfNeeded();
    await lb
      .locator('ion-content')
      .evaluate((content) =>
        (content as HTMLElement & { scrollToBottom: (ms: number) => Promise<void> }).scrollToBottom(0),
      );
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
    await page.getByRole('link', { name: en.profile.settings, exact: true }).click();
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
    test.skip(!COMMUNITY, 'Community is switched off (VITE_COMMUNITY)');
    await loginAs();
    await page.goto('/tabs/profile');
    await page.getByRole('link', { name: en.profile.settings, exact: true }).click();
    await page.getByTestId('setting-leaderboard').click();
    await expect(page.getByTestId('setting-leaderboard')).toHaveAttribute('aria-checked', 'false');
    await page
      .getByRole('navigation', { name: en.tabs.navLabel })
      .getByRole('tab', { name: en.tabs.short.community, exact: true })
      .click();
    await page.getByTestId('community-wall-board').click();
    await expect(page.getByTestId('join-banner')).toBeVisible();
    await expect(page.getByTestId('my-row')).toHaveCount(0);
  });

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

        test('recolors each part, saves on its own, and keeps it after a reload', async ({ page, loginAs }) => {
          const copy = lang === 'ar' ? ar : en;
          await loginAs();
          await page.goto('/tabs/profile/character');
          const editor = page.locator(tab('character'));
          const preview = editor.getByTestId('character-preview');
          await expect(preview).toHaveAttribute('data-figure', 'hd-casual');
          await expect(preview.locator('image')).toHaveCount(9);

          const pick = async (part: keyof typeof copy.avatar.tab, color: keyof typeof copy.avatar.color) => {
            await editor.getByRole('tab', { name: copy.avatar.tab[part], exact: true }).click();
            await editor
              .getByRole('radiogroup', { name: copy.avatar.tab[part] })
              .getByRole('radio', { name: copy.avatar.color[color], exact: true })
              .click();
          };
          await pick('top', 'royal');
          await pick('hair', 'blonde');
          await pick('shoes', 'blue');
          await expect(preview.locator('[data-layer="hoodie"]')).toHaveAttribute('data-color', 'royal');
          await expect(preview.locator('[data-layer="hair"]')).toHaveAttribute('data-color', 'blonde');
          await expect(preview.locator('[data-layer="shoe-left"]')).toHaveAttribute('data-color', 'blue');
          await expect(editor.getByTestId('character-status')).toHaveText(copy.avatar.saved);

          await page.reload();
          await expect(
            page.locator(tab('character')).getByTestId('character-preview').locator('[data-layer="hoodie"]'),
          ).toHaveAttribute('data-color', 'royal');
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        });
      });
    }
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
    const hair = editor.getByRole('radiogroup', { name: en.avatar.tab.hair });
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
    const top = (color: keyof typeof en.avatar.color) =>
      editor
        .getByRole('radiogroup', { name: en.avatar.tab.top })
        .getByRole('radio', { name: en.avatar.color[color], exact: true });
    await editor.getByRole('tab', { name: en.avatar.tab.top, exact: true }).click();
    await failNextWrite();
    await top('forest').click();
    await expect(editor.getByRole('alert')).toHaveText(en.avatar.saveFailed);
    await expect(preview.locator('[data-layer="hoodie"]')).toHaveAttribute('data-color', 'forest');
    expect(await page.evaluate((key) => localStorage.getItem(key), AVATAR_KEY)).toBeNull();
    await editor.getByRole('button', { name: en.common.retry, exact: true }).click();
    await expect(editor.getByTestId('character-status')).toHaveText(en.avatar.saved);
    await failNextWrite();
    await top('teal').click();
    await expect(editor.getByRole('alert')).toHaveText(en.avatar.saveFailed);
    await editor.getByRole('button', { name: en.avatar.discardUnsaved, exact: true }).click();
    await expect(preview.locator('[data-layer="hoodie"]')).toHaveAttribute('data-color', 'forest');
    await editor.getByTestId('character-back').click();
    await expect(page.getByTestId('profile-avatar').locator('[data-layer="hoodie"]')).toHaveAttribute(
      'data-color',
      'forest',
    );
  });
});
