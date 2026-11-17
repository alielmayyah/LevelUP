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
        await expect(bc.getByTestId('bar-weight')).toContainText(s.bodyComp.zone.normal);
        await expect(bc.getByTestId('bar-pbf')).toContainText(s.bodyComp.zone.under);
        await expect(bc.getByTestId('bar-smm-delta')).toContainText('0.9');
        // The figure: muscle by default, fat on tap.
        const segs = bc.getByTestId('segments');
        const figure = segs.getByTestId('segments-figure');
        await expect(figure).toHaveAttribute('data-view', 'lean');
        await expect(figure.locator('[data-part]')).toHaveCount(5);
        await expect(segs.getByTestId('seg-trunk')).toBeVisible();
        await segs.getByRole('radio', { name: s.bodyComp.fatView }).click();
        await expect(figure).toHaveAttribute('data-view', 'fat');
        await expect(figure.locator('[data-part="trunk"]')).toHaveAttribute('data-status', 'under');
        await expect(segs.getByTestId('seg-trunk')).toContainText(s.bodyComp.zone.under);
        const scanBox = (await figure.boundingBox())!;
        const leftBox = (await segs.getByTestId('seg-leftArm').boundingBox())!;
        const rightBox = (await segs.getByTestId('seg-rightArm').boundingBox())!;
        expect(leftBox.x + leftBox.width).toBeLessThan(scanBox.x);
        expect(rightBox.x).toBeGreaterThan(scanBox.x + scanBox.width);
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
    await page.getByRole('dialog').getByRole('button', { name: en.profile.cancel }).click();
    await expect(page).toHaveURL(/\/tabs\/profile\/settings$/);
  });
});

test.describe('Character', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const lang of ['en', 'ar'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test.describe(`${lang}/${theme}`, () => {
        test.use({ lang, theme });
        test('previews and saves styles and colors', async ({ page, loginAs }) => {
          const copy = lang === 'ar' ? ar : en;
          await loginAs();
          await page.addInitScript(
            (legacy) => {
              const key = 'CapacitorStorage.lu.mock.avatar.101';
              if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(legacy));
            },
            {
              schemaVersion: 1,
              rig: 'standard',
              styles: { hair: 'sport-hijab', body: 'balanced', top: 'zip-hoodie', shoes: 'trainers' },
              colors: {
                skin: 'warm-tan',
                hair: 'espresso',
                eyes: 'dark-brown',
                tank: 'levelup-violet',
                shorts: 'deep-violet',
                shoes: 'off-white',
              },
              hairUnderHijab: 'waves',
            },
          );
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
          await expect(preview).toHaveAttribute('data-rig', 'standard');
          await expect(preview.locator('[data-style-layer="hair"]')).toHaveAttribute('data-variant', 'waves');
          await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-variant', 'zip-hoodie');
          await expect(preview.locator('[data-paint="hijab-fabric"]')).toHaveCount(0);
          await expect(outfits.getByRole('button', { name: copy.avatar.outfit['hijab-training'] })).toHaveCount(0);
          await expect(outfits.getByRole('button', { name: copy.avatar.outfit['hijab-tank'] })).toHaveCount(0);
          await expect(outfits.getByRole('button', { name: copy.avatar.outfit['violet-training'] })).toHaveCount(0);
          const hoodUp = outfits.getByRole('button', { name: copy.avatar.outfit['hoodie-warmup'], exact: true });
          await hoodUp.click();
          await expect(preview.locator('[data-art-detail="raised-hood"]')).toHaveCount(1);
          await expect(preview.locator('[data-paint="hijab-fabric"], [data-art-detail="hijab-face"]')).toHaveCount(0);
          await expect(preview.locator('[data-style-layer="hair"]')).toHaveCount(0);
          await expect(preview.locator('[data-art-detail="folded-hood"]')).toHaveCount(0);
          await selectTab('top');
          const hoodTile = editor.getByRole('radio', { name: copy.avatar.style['hood-up'], exact: true });
          await expect(hoodTile.locator('svg[data-crop="top"] [data-art-detail="raised-hood"]')).toHaveCount(1);
          await selectTab('outfits');
          const studio = outfits.getByRole('button', { name: copy.avatar.outfit['studio-flow'] });
          await studio.click();
          await expect(studio).toHaveAttribute('aria-pressed', 'true');
          await expect(preview.locator('[data-style-layer="shoes"]')).toHaveAttribute('data-variant', 'barefoot');
          await expect(preview.locator('[data-style-layer="socks"]')).toHaveAttribute('data-variant', 'grip-socks');
          const strength = outfits.getByRole('button', { name: copy.avatar.outfit['strength-day'] });
          await strength.click();
          await expect(strength).toHaveAttribute('aria-pressed', 'true');
          await expect(preview.locator('[data-art-detail="sleeveless-hoodie"]')).toHaveCount(1);
          await expect(preview.locator('[data-style-layer="pants"]')).toHaveAttribute('data-variant', 'liner-shorts');
          const summer = outfits.getByRole('button', { name: copy.avatar.outfit['summer-fit'] });
          await summer.click();
          await expect(preview.locator('[data-style-layer="pants"]')).toHaveAttribute('data-variant', 'shorts');
          await expect(preview.locator('[data-style-layer="shoes"]')).toHaveAttribute('data-variant', 'cross-trainers');
          const darkHoodie = outfits.getByRole('button', { name: copy.avatar.outfit['dark-hoodie'] });
          await darkHoodie.click();
          await expect(darkHoodie).toHaveAttribute('aria-pressed', 'true');
          await expect(summer).toHaveAttribute('aria-pressed', 'false');
          await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-variant', 'hoodie');
          await expect(preview.locator('[data-art-detail="stitched-hoodie"]')).toHaveCount(1);
          await expect(preview.locator('[data-art-detail="folded-hood"]')).toHaveCount(1);
          await expect(preview.locator('[data-style-layer="hair"]')).toHaveCount(1);
          await expect(preview.locator('[data-style-layer="pants"]')).toHaveAttribute('data-variant', 'joggers');
          await expect(preview.locator('image')).toHaveCount(0);
          const choices = [
            ['hair', 'tapered-curls'],
            ['body', 'long-limbed'],
            ['top', 'quarter-zip'],
            ['shoes', 'flat-lifters'],
            ['pants', 'loose-training-shorts'],
            ['beard', 'boxed-beard'],
            ['socks', 'compression-socks'],
          ] as const;
          for (const [part, id] of choices) {
            await selectTab(part);
            await expect(editor.getByTestId('character-options')).toHaveJSProperty('scrollTop', 0);
            if (part === 'hair') {
              await expect(editor.getByRole('radio', { name: copy.avatar.style['sport-hijab'] })).toHaveCount(0);
            }
            const option = editor
              .getByRole('radiogroup', { name: copy.avatar.styleLabel[part] })
              .getByRole('radio', { name: copy.avatar.style[id], exact: true });
            await option.click();
            await expect(option).toHaveAttribute('aria-checked', 'true');
            await expect(preview.locator(`[data-style-layer="${part}"]`)).toHaveAttribute('data-variant', id);
            if (part === 'hair') await color('hair', 'silver').click();
            if (part === 'body') await color('skin', 'rich-brown').click();
            if (part === 'top') await color('tank', 'sage').click();
            if (part === 'pants') await color('shorts', 'graphite').click();
            if (part === 'shoes') await color('shoes', 'gum').click();
            if (part === 'beard') {
              const beard = preview.locator('[data-paint="beard-hair"]');
              await color('beard', 'silver').click();
              const silver = await beard.getAttribute('fill');
              await color('beard', 'auburn').click();
              await expect(beard).not.toHaveAttribute('fill', silver!);
            }
            if (part === 'socks') {
              const sock = preview.locator('[data-paint="sock-fabric"]').first();
              const before = await sock.getAttribute('fill');
              await color('socks', 'violet').click();
              await expect(sock).not.toHaveAttribute('fill', before!);
            }
          }
          await selectTab('face');
          const face = editor.getByRole('tabpanel', { name: copy.avatar.tab.face });
          await color('eyes', 'brown').click();
          await face
            .getByRole('radiogroup', { name: copy.avatar.styleLabel.face, exact: true })
            .getByRole('radio', { name: copy.avatar.style.grin, exact: true })
            .click();
          await expect(preview.locator('[data-style-layer="face"]')).toHaveAttribute('data-variant', 'grin');
          const eyes = preview.locator('[data-feature="iris"]');
          await expect(eyes.first()).toHaveAttribute('d', /M/);
          expect(
            new Set(await eyes.evaluateAll((paths) => paths.map((path) => path.getAttribute('fill')))).size,
          ).toBeGreaterThan(1);
          await expect(preview.locator('[data-feature="smile"]')).toHaveCount(1);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          // No Save button: every change saves on its own.
          await expect(editor.getByTestId('character-status')).toHaveText(copy.avatar.saved);
          const savedColors = await page.evaluate(
            () => JSON.parse(localStorage.getItem('CapacitorStorage.lu.mock.avatar.101')!).colors,
          );
          expect(savedColors).not.toHaveProperty('smile');
          await editor.getByTestId('character-back').click();
          await expect(page).toHaveURL(/\/tabs\/profile$/);
          await expect(page.getByTestId('profile-avatar').locator('[data-style-layer="hair"]')).toHaveAttribute(
            'data-variant',
            'tapered-curls',
          );

          await page.reload();
          await page.getByRole('link', { name: copy.profile.customize }).click();
          for (const [part, id] of choices) {
            await expect(preview.locator(`[data-style-layer="${part}"]`)).toHaveAttribute('data-variant', id);
          }
          await expect(preview.locator('[data-style-layer="face"]')).toHaveAttribute('data-variant', 'grin');
          await selectTab('beard');
          await expect(color('beard', 'auburn')).toHaveAttribute('aria-checked', 'true');
          await selectTab('socks');
          await expect(color('socks', 'violet')).toHaveAttribute('aria-checked', 'true');
          await selectTab('hair');
          await expect(color('hair', 'silver')).toHaveAttribute('aria-checked', 'true');
        });

        test('saves and removes character glasses', async ({ page, loginAs }) => {
          const copy = lang === 'ar' ? ar : en;
          const women = lang === 'ar';
          const style = theme === 'dark' ? 'sport-glasses' : women ? 'round-glasses' : 'rectangular-glasses';
          await loginAs(women ? '102' : '101');
          await page.goto('/tabs/profile/character');
          const editor = page.locator(tab('character'));
          const preview = editor.getByTestId('character-preview');
          const openFace = () => editor.getByRole('tab', { name: copy.avatar.tab.face, exact: true }).click();
          const frames = editor.getByRole('radiogroup', { name: copy.avatar.styleLabel.glasses, exact: true });
          const noGlasses = frames.getByRole('radio', { name: copy.avatar.style['no-glasses'], exact: true });
          const option = frames.getByRole('radio', { name: copy.avatar.style[style], exact: true });
          const previewFrames = preview.locator('[data-style-layer="glasses"]');
          const portraitFrames = page.getByTestId('profile-avatar').locator('[data-style-layer="glasses"]');
          const outfit = women ? 'hijab-training' : 'hoodie-warmup';

          await editor.getByRole('button', { name: copy.avatar.outfit[outfit], exact: true }).click();
          await openFace();
          await expect(noGlasses).toBeChecked();
          await expect(previewFrames).toHaveCount(0);
          await option.click();
          await expect(option).toBeChecked();
          await expect(previewFrames).toHaveAttribute('data-variant', style);
          await expect(
            preview.locator(women ? '[data-paint="hijab-fabric"]' : '[data-art-detail="raised-hood"]'),
          ).toHaveCount(1);
          if (women) {
            await editor.getByRole('tab', { name: copy.avatar.tab.outfits, exact: true }).click();
            await editor.getByRole('button', { name: copy.avatar.outfit['hoodie-warmup'], exact: true }).click();
            await expect(preview.locator('[data-art-detail="raised-hood"]')).toHaveCount(1);
            await expect(preview.locator('[data-art-detail="hijab-face"]')).toHaveCount(1);
            await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-fit', 'tailored');
            await expect(preview.locator('[data-art-detail="tailored-pants"]')).toHaveAttribute(
              'data-variant',
              'tapered-joggers',
            );
            await expect(previewFrames).toHaveAttribute('data-variant', style);
          }
          if (women) await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
          if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/ion-palette-dark/);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

          await editor.getByTestId('character-back').click();
          await expect(page).toHaveURL(/\/tabs\/profile$/);
          await expect(portraitFrames).toHaveAttribute('data-variant', style);
          await page.reload();
          await expect(portraitFrames).toHaveAttribute('data-variant', style);
          await page.getByRole('link', { name: copy.profile.customize }).click();
          await openFace();
          await expect(option).toBeChecked();
          await option.press('Home');
          await expect(noGlasses).toBeChecked();
          await expect(previewFrames).toHaveCount(0);
          await editor.getByTestId('character-back').click();
          await expect(page).toHaveURL(/\/tabs\/profile$/);
          await expect(portraitFrames).toHaveCount(0);
        });

        test('shows the women’s catalog and keeps a customized hijab after reload', async ({ page, loginAs }) => {
          const copy = lang === 'ar' ? ar : en;
          await loginAs('102');
          await page.goto('/tabs/profile');
          await page.getByRole('link', { name: copy.profile.customize }).click();
          const editor = page.locator(tab('character'));
          const preview = editor.getByTestId('character-preview');
          const selectTab = (key: keyof typeof copy.avatar.tab) =>
            editor.getByRole('tab', { name: copy.avatar.tab[key], exact: true }).click();

          await expect(preview).toHaveAttribute('data-rig', 'women');
          await expect(preview.locator('[data-style-layer="hair"]')).toHaveAttribute('data-variant', 'high-ponytail');
          await expect(editor.getByRole('tab', { name: copy.avatar.tab.beard })).toHaveCount(0);
          await selectTab('body');
          await expect(editor.getByRole('radiogroup')).toHaveCount(2);
          await editor.getByRole('radio', { name: copy.avatar.style.athletic, exact: true }).click();

          await selectTab('outfits');
          const preset = editor.getByRole('button', { name: copy.avatar.outfit['hijab-training'] });
          await preset.click();
          await expect(preset).toHaveAttribute('aria-pressed', 'true');
          await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-variant', 'fitted-zip');
          await expect(preview.locator('[data-art-detail="tailored-pants"]')).toHaveAttribute(
            'data-variant',
            'track-pants',
          );
          const tankOutfit = editor.getByRole('button', { name: copy.avatar.outfit['hijab-tank'], exact: true });
          await tankOutfit.click();
          await expect(tankOutfit).toHaveAttribute('aria-pressed', 'true');
          await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-variant', 'longline-tank');
          await expect(preview.locator('[data-paint="hijab-fabric"]')).toHaveCount(1);
          await selectTab('hair');
          await expect(editor.getByRole('radio', { name: copy.avatar.style.fade, exact: true })).toHaveCount(0);
          const hijab = editor.getByRole('radio', { name: copy.avatar.style['sport-hijab'], exact: true });
          await expect(hijab).toBeChecked();
          await editor.getByRole('radio', { name: copy.avatar.style['braided-ponytail'] }).click();
          await hijab.click();
          const fabric = preview.locator('[data-paint="hijab-fabric"]');
          const sportCut = await fabric.getAttribute('d');
          await editor.getByRole('radio', { name: copy.avatar.style['wrap-hijab'], exact: true }).click();
          await expect(fabric).not.toHaveAttribute('d', sportCut!);
          const wrapCut = await fabric.getAttribute('d');
          await editor.getByRole('radio', { name: copy.avatar.style['longline-hijab'], exact: true }).click();
          await expect(fabric).not.toHaveAttribute('d', wrapCut!);
          await expect(preview.locator('[data-art-detail="back-hair"]')).toHaveCount(0);
          const originalColor = await fabric.getAttribute('fill');
          const sage = editor
            .getByRole('radiogroup', { name: copy.avatar.part.hijab })
            .getByRole('radio', { name: copy.avatar.color.sage, exact: true });
          await sage.click();
          await expect(fabric).not.toHaveAttribute('fill', originalColor!);
          await expect
            .poll(() =>
              page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.lu.mock.avatar.102') ?? 'null')),
            )
            .toMatchObject({
              rig: 'women',
              styles: { body: 'athletic', hair: 'longline-hijab', top: 'longline-tank' },
              colors: { hijab: 'sage' },
              hairUnderHijab: 'braided-ponytail',
            });

          await editor.getByTestId('character-back').click();
          const portrait = page.getByTestId('profile-avatar');
          await expect(page).toHaveURL(/\/tabs\/profile$/);
          await expect(portrait).toHaveAttribute('data-rig', 'women');
          await expect(portrait.locator('[data-style-layer="hair"]')).toHaveAttribute('data-variant', 'longline-hijab');
          await page.reload();
          await expect(portrait.locator('[data-paint="hijab-fabric"]')).toHaveCount(1);
          await page.getByRole('link', { name: copy.profile.customize }).click();
          await selectTab('hair');
          await expect(sage).toBeChecked();
          await editor.getByRole('button', { name: copy.avatar.removeHijab }).click();
          await expect(preview.locator('[data-style-layer="hair"]')).toHaveAttribute(
            'data-variant',
            'braided-ponytail',
          );
          await expect(preview.locator('[data-art-detail="back-hair"]')).toHaveCount(1);
        });
      });
    }
  }

  test('the reference preset and independent body proportions survive a reload', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.getByTestId('page-character');
    const sprite = editor.getByTestId('character-preview');
    await expect(sprite).toHaveAttribute('data-art-style', 'sprite-32bit');

    const preset = editor.getByRole('button', { name: en.avatar.preset['silver-sprinter'], exact: true });
    await preset.click();
    await expect(preset).toHaveAttribute('aria-pressed', 'true');
    await expect(sprite.locator('[data-style-layer="hair"]')).toHaveAttribute('data-variant', 'spikes');
    await expect(sprite.locator('[data-style-layer="shoes"]')).toHaveAttribute('data-variant', 'high-tops');

    const lower = sprite.locator('[data-body-region="lower"]');
    const head = sprite.locator('[data-style-layer="hair"]');
    const headDrawing = await head.locator('path').first().getAttribute('d');
    const top = sprite.locator('[data-style-layer="top"] path').first();
    const topDrawing = await top.getAttribute('d');
    const before = (await lower.getAttribute('transform'))!;
    await editor.getByRole('tab', { name: en.avatar.tab.body, exact: true }).click();
    await editor.getByRole('radio', { name: en.avatar.style['long-limbed'], exact: true }).click();
    await expect(lower).not.toHaveAttribute('transform', before);
    await expect(head.locator('path').first()).toHaveAttribute('d', headDrawing!);
    await expect(top).toHaveAttribute('d', topDrawing!);

    await editor.getByRole('tab', { name: en.avatar.tab.shoes, exact: true }).click();
    await editor.getByRole('radio', { name: en.avatar.style.barefoot, exact: true }).click();
    await expect(sprite.locator('[data-style-layer="shoes"]')).toHaveAttribute('data-variant', 'barefoot');
    await expect(head.locator('path').first()).toHaveAttribute('d', headDrawing!);
    await expect(top).toHaveAttribute('d', topDrawing!);
    await expect(editor.getByTestId('character-status')).toHaveText(en.avatar.saved);

    await page.reload();
    await expect(sprite.locator('[data-style-layer="body"]')).toHaveAttribute('data-variant', 'long-limbed');
    await expect(sprite.locator('[data-style-layer="hair"]')).toHaveAttribute('data-variant', 'spikes');
  });

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

  test('a failed autosave keeps the edited outfit available to retry', async ({ page, loginAs }) => {
    await loginAs();
    await page.goto('/tabs/profile/character');
    const editor = page.locator(tab('character'));
    const preview = editor.getByTestId('character-preview');
    await expect(preview).toBeVisible();
    const failNextWrite = () =>
      page.evaluate(() => {
        const write = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (key === 'CapacitorStorage.lu.mock.avatar.101') {
            Storage.prototype.setItem = write;
            throw new Error('Storage temporarily unavailable');
          }
          write.call(this, key, value);
        };
      });
    await failNextWrite();
    await editor.getByRole('button', { name: en.avatar.outfit.conditioning, exact: true }).click();
    await expect(editor.getByRole('alert')).toHaveText(en.avatar.saveFailed);
    await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-variant', 'raglan-top');
    expect(await page.evaluate(() => localStorage.getItem('CapacitorStorage.lu.mock.avatar.101'))).toBeNull();
    await editor.getByRole('button', { name: en.common.retry, exact: true }).click();
    await expect(editor.getByTestId('character-status')).toHaveText(en.avatar.saved);
    await failNextWrite();
    await editor.getByRole('button', { name: en.avatar.outfit['zip-hoodie-session'], exact: true }).click();
    await expect(editor.getByRole('alert')).toHaveText(en.avatar.saveFailed);
    await editor.getByRole('button', { name: en.avatar.discardUnsaved, exact: true }).click();
    await expect(preview.locator('[data-style-layer="top"]')).toHaveAttribute('data-variant', 'raglan-top');
    await editor.getByTestId('character-back').click();
    await expect(page.getByTestId('profile-avatar').locator('[data-style-layer="top"]')).toHaveAttribute(
      'data-variant',
      'raglan-top',
    );
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
