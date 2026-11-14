/* Progress, Goals, Leaderboard, and Profile behavior against the mock API. */
import ar from '../src/i18n/ar.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };
import { expect, test } from './fixtures';

const tab = (name: string) => `[data-testid="page-${name}"]`;

test.describe('Progress', () => {
  test("Sam's key numbers, their change, and one trend at a time", async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/progress');
    const p = page.locator(tab('progress'));
    await expect(p.getByTestId('metric-weight')).toContainText('82.6 kg');
    await expect(p.getByTestId('change-muscle')).toContainText('▲ 0.8 kg');
    await expect(p.getByTestId('trend-headline')).toContainText('82.6 kg');
    // All nine measurements show; the other six each explain themselves.
    await expect(p.getByTestId('metric-visceral')).toContainText(en.progress.hint.visceral);
    // Each measurement explains itself in a pop-up.
    await p.getByTestId('info-muscle').click();
    const info = page.getByRole('dialog', { name: en.progress.metric.muscle });
    await expect(info).toContainText(en.progress.info.muscle.tip);
    await page.keyboard.press('Escape');
    await expect(info).toBeHidden();
    // An earlier scan is one tap away.
    await p.getByRole('button', { name: en.progress.olderScan }).click();
    await expect(p.getByTestId('metric-weight')).toContainText('83.3 kg');
    await p.getByRole('button', { name: en.progress.newerScan }).click();
    // View all scans: pick any scan from the full list.
    await p.getByTestId('view-all-scans').click();
    const sheet = page.getByTestId('scan-history');
    await expect(sheet.getByTestId('scan-row')).toHaveCount(6);
    await sheet.getByTestId('scan-row').nth(5).click();
    await expect(p.getByTestId('scan-date')).toContainText('1');
    await expect(p.getByTestId('change-weight')).toHaveText(en.progress.firstScan);
    // One line at a time; tapping a point shows its value.
    await expect(p.getByTestId('chart-trend')).toBeVisible();
    await p.getByTestId('chart-trend-point-5').click();
    await expect(p.getByTestId('chart-trend-tip')).toContainText('82.6');
    await p.getByRole('radio', { name: en.progress.metric.muscle }).click();
    await p.getByTestId('chart-trend-point-5').click();
    await expect(p.getByTestId('chart-trend-tip')).toContainText('34.9');
  });

  test('Omar: one scan, so changes and trends wait for the second', async ({ page, loginAs }) => {
    await loginAs('103');
    await page.goto('/tabs/progress');
    await expect(page.getByText(en.progress.secondScan)).toBeVisible();
    await expect(page.getByTestId('change-muscle')).toHaveText(en.progress.changeLater);
    await expect(page.getByTestId('trend-score')).toHaveCount(0);
  });
});

test.describe('Goals', () => {
  test('every goal is on one page, with the journey on top', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/goals');
    const g = page.locator(tab('goals'));
    await expect(g.getByTestId('journey')).toContainText(`2/4 ${en.goals.done}`);
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
});

test.describe('Leaderboard', () => {
  test('highlights Sam and remembers the board across a reload', async ({ page, loginAs }) => {
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
    await expect(list.getByTestId('my-row').locator('svg').first()).toBeVisible();
    // 10 rows after the podium fit on one page, so no pager.
    await expect(lb.getByTestId('pager')).toHaveCount(0);
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
    await expect(page.locator(tab('progress')).getByTestId('chart-trend')).toBeVisible();
    await expect(page.locator(tab('progress')).getByTestId('trend-score')).toHaveCount(0);
  });

  test('turning off the leaderboard setting removes Sam from the boards', async ({ page, loginAs }) => {
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
          await expect(preview.locator('[data-style-layer="pants"]')).toHaveAttribute('data-variant', 'joggers');
          const choices = [
            ['hair', 'locs'],
            ['body', 'broad'],
            ['top', 'hoodie'],
            ['shoes', 'high-tops'],
            ['pants', 'cargo'],
            ['beard', 'goatee'],
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
          }
          await selectTab('face');
          await color('eyes', 'brown').click();
          const eyes = preview.locator('[data-feature="eyes"] path');
          await expect(eyes).toHaveCount(2);
          expect(await eyes.first().getAttribute('fill')).not.toBe(await eyes.last().getAttribute('fill'));
          await expect(preview.locator('[data-feature="smile"]')).toHaveCount(1);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await editor.getByTestId('character-save').click();
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

  test('leaving with unsaved changes asks first, and Keep editing stays', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.locator(tab('character'));
    await editor.getByTestId('character-random').click();
    await editor.getByTestId('character-back').click();
    const dialog = page.getByRole('dialog', { name: en.avatar.leaveTitle });
    await dialog.getByRole('button', { name: en.avatar.keepEditing }).click();
    await expect(page).toHaveURL(/\/tabs\/profile\/character$/);
    await editor.getByTestId('character-back').click();
    await dialog.getByRole('button', { name: en.avatar.discard }).click();
    await expect(page).toHaveURL(/\/tabs\/profile$/);
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
