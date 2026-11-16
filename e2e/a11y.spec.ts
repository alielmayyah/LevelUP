/*
 * Automated accessibility check (axe-core, WCAG 2.2 AA plus best practices)
 * on every screen, in both languages and both themes. Any violation fails.
 */
import { createRequire } from 'node:module';

import { expect, LOCALES, test, THEMES } from './fixtures';

const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

const SCREENS: { name: string; url: string; fitId?: string; open?: 'notifications' | 'signOut' }[] = [
  { name: 'splash', url: '/splash?stay' },
  { name: 'login', url: '/login' },
  { name: 'home', url: '/tabs/home', fitId: '101' },
  { name: 'home (new member)', url: '/tabs/home', fitId: '102' },
  { name: 'notifications', url: '/tabs/home', fitId: '101', open: 'notifications' },
  { name: 'progress', url: '/tabs/progress', fitId: '101' },
  { name: 'goals', url: '/tabs/goals', fitId: '101' },
  { name: 'new goal', url: '/tabs/goals/new', fitId: '101' },
  { name: 'new goal (no scan)', url: '/tabs/goals/new', fitId: '102' },
  { name: 'leaderboard', url: '/tabs/leaderboard', fitId: '101' },
  { name: 'leaderboard (not joined)', url: '/tabs/leaderboard', fitId: '102' },
  { name: 'community', url: '/tabs/community', fitId: '101' },
  { name: 'profile', url: '/tabs/profile', fitId: '101' },
  { name: 'settings', url: '/tabs/profile/settings', fitId: '101' },
  { name: 'character editor', url: '/tabs/profile/character', fitId: '101' },
  { name: 'medals', url: '/tabs/profile/medals', fitId: '101' },
  { name: 'medals (no data)', url: '/tabs/profile/medals', fitId: '102' },
  { name: 'sign-out dialog', url: '/tabs/profile/settings', fitId: '101', open: 'signOut' },
];

for (const lang of LOCALES)
  for (const theme of THEMES)
    test.describe(`${lang}/${theme}`, () => {
      test.use({ lang, theme });

      for (const s of SCREENS)
        test(`${s.name} has no accessibility violations`, async ({ page, loginAs }, info) => {
          test.skip(info.project.name !== 'iphone', 'One device size is enough for markup and contrast checks.');
          if (s.fitId) await loginAs(s.fitId);
          await page.goto(s.url);
          await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
          if (s.open === 'notifications') {
            await page.getByTestId('bell').click();
            await expect(page.getByTestId('notification').first()).toBeVisible();
          }
          if (s.open === 'signOut') {
            await page.locator('.lu-signout').click();
            await expect(page.getByRole('dialog')).toBeVisible();
          }
          // Let intro and count-up animations finish so contrast is measured on final colors.
          await page.waitForTimeout(1200);
          // On a busy machine some entrances run late: wait for every finite animation to end
          // (looping glows never finish, so they are left alone).
          await page.evaluate(() =>
            Promise.all(
              document
                .getAnimations()
                .filter((a) => a.effect?.getTiming().iterations !== Infinity)
                .map((a) => a.finished.catch(() => undefined)),
            ),
          );
          // Content scrolls under the floating tab bar by design; at the bottom of the page the
          // reserved padding leaves nothing under it. Focus is checked separately below (2.4.11).
          if (s.url.startsWith('/tabs/') && !s.open)
            await page
              .locator(`ion-content`)
              .last()
              .evaluate((el) =>
                (el as HTMLElement & { scrollToBottom: (ms: number) => Promise<void> }).scrollToBottom(0),
              );
          await page.addScriptTag({ path: AXE });
          const violations = await page.evaluate(async () => {
            const w = window as unknown as {
              axe: {
                run: (
                  ctx: Document,
                  opts: object,
                ) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }>;
              };
            };
            const r = await w.axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
              },
            });
            return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
          });
          expect(violations).toEqual([]);
        });
    });

/** WCAG 2.4.11: a focused control is never hidden behind the floating tab bar. */
for (const lang of LOCALES)
  for (const tab of ['home', 'progress', 'goals', 'community', 'leaderboard', 'profile', 'profile/settings'])
    test.describe(`${lang}`, () => {
      test.use({ lang });
      test(`${tab}: keyboard focus never sits under the tab bar`, async ({ page, loginAs }) => {
        await loginAs();
        await page.goto(`/tabs/${tab}`);
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
        const hidden: string[] = [];
        for (let i = 0; i < 30; i++) {
          await page.keyboard.press('Tab');
          const r = await page.evaluate(async () => {
            // Let the browser finish scrolling the newly focused control into view
            // (it can take a few frames on a busy machine), then measure where it rests.
            const frame = () => new Promise((done) => requestAnimationFrame(done));
            for (let f = 0; f < 6; f++) await frame();
            const a = document.activeElement as HTMLElement | null;
            // Then wait until it stops moving (up to ~1 s), so a slow smooth scroll isn't caught mid-way.
            for (let f = 0, last = NaN; a && f < 60; f++) {
              const top = a.getBoundingClientRect().top;
              if (top === last) break;
              last = top;
              await frame();
            }
            const bar = document.querySelector('.lu-tabbar');
            if (!a || !bar || bar.contains(a) || a === document.body) return null;
            const box = a.getBoundingClientRect();
            // Only controls count: the browser can also focus a whole scrollable page, which always spans the bar.
            if (box.height > window.innerHeight / 2) return null;
            const barTop = bar.getBoundingClientRect().top;
            return {
              name: (a.getAttribute('aria-label') ?? a.textContent ?? '').trim().slice(0, 40),
              under: box.bottom > barTop + 1,
            };
          });
          if (r?.under) hidden.push(r.name);
        }
        expect(hidden).toEqual([]);
      });
    });
