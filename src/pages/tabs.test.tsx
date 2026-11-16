/*
 * Progress, Goals, Leaderboard, and Profile against the mock API, for the
 * three mock members: 101 Mohamed (full), 102 Lina (new), 103 Omar (one scan,
 * FitScore hidden, membership ending soon).
 */
import { Preferences } from '@capacitor/preferences';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockServer, resetMockServer } from '../api/mock/server';
import type { AssessmentDto, GoalsDto, LeaderboardDto } from '../api/types';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import { resetSound } from '../sound/useSound';
import Community from './Community';
import Goals from './Goals';
import Leaderboard from './Leaderboard';
import NewGoal from './NewGoal';
import Profile from './Profile';
import Progress from './Progress';
import Settings from './Settings';

const NOW = new Date('2026-11-13T10:00:00Z');

async function renderAs(fitId: string, Page: React.FC) {
  await setToken(`mock.${fitId}`);
  return render(
    <MemoryRouter initialEntries={['/tabs/x']}>
      <Route exact path="/tabs/x" component={Page} />
      <Route exact path="/login" render={() => <p>login page</p>} />
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  await Preferences.clear();
  resetMockServer(NOW);
  resetSound();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await setLanguage('en');
});

describe('Progress', () => {
  it('tapping the scan date opens a calendar of scans; tapping a scan day shows that scan', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('scan-calendar-open'));
    const cal = await screen.findByTestId('scan-calendar');
    expect(within(cal).getByTestId('calendar-month')).toHaveTextContent('November 2026');
    // The scan on screen is marked; later months can't be reached.
    const days = within(cal).getAllByTestId('calendar-scan-day');
    expect(days).toHaveLength(1);
    expect(days[0]).toHaveAttribute('aria-current', 'date');
    expect(days[0]).toHaveAccessibleName(/^Scan on .*November \d+, 2026$/);
    expect(within(cal).getByTestId('calendar-next')).toBeDisabled();
    await userEvent.click(within(cal).getByTestId('calendar-prev'));
    expect(within(cal).getByTestId('calendar-month')).toHaveTextContent('October 2026');
    await userEvent.click(within(cal).getByTestId('calendar-scan-day'));
    expect(screen.getByTestId('scan-title')).toHaveTextContent('Oct 15, 2026');
  });

  it('opens on the key numbers; body composition and trends wait behind View more details', async () => {
    await renderAs('101', Progress);
    const more = await screen.findByTestId('progress-more');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('body-comp')).toBeNull();
    await userEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(more).toHaveTextContent('Show less');
    // Body composition is its own lazy chunk; on a busy CI runner it can take over a second.
    expect(await screen.findByTestId('body-comp', {}, { timeout: 5000 })).toBeInTheDocument();
    await userEvent.click(more);
    expect(screen.queryByTestId('body-comp')).toBeNull();
  });

  it("shows Mohamed's 3 key numbers with their change, and the other 6 under More", async () => {
    await renderAs('101', Progress);
    const scan = await screen.findByTestId('latest-scan');
    expect(within(scan).getAllByRole('term')).toHaveLength(3);
    const more = screen.getByTestId('more-metrics');
    expect(within(more).getAllByRole('term')).toHaveLength(6);
    expect(within(scan).getByTestId('metric-weight')).toHaveTextContent(/80\.0\s?kg/);
    expect(within(scan).getByTestId('metric-bodyFat')).toHaveTextContent('8.0%');
    expect(within(more).getByTestId('metric-visceral')).toHaveTextContent(/^Visceral fat3/);
    expect(within(more).getByTestId('metric-bmr')).toHaveTextContent(/1,\d{3}\s?kcal/);
    // The six smaller cards show the change since the scan before, with a sign.
    for (const key of ['water', 'protein', 'minerals', 'bmr', 'bmi', 'visceral'])
      expect(within(more).getByTestId(`change-${key}`)).toHaveTextContent(/^[+−]|±0/);
    // Muscle up is good news (green), body fat down is good news (green), weight has no right way.
    expect(within(scan).getByText('Up 0.9 kg since the scan before').parentElement).toHaveClass('text-success');
    expect(within(scan).getByText('Down 1.1% since the scan before').parentElement).toHaveClass('text-success');
    expect(within(scan).getByText('Up 0.7 kg since the scan before').parentElement).toHaveClass('text-muted');
  });

  it('draws one trend at a time, with a screen-reader summary, and switches metric', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    expect(await screen.findByTestId('chart-trend')).toBeInTheDocument();
    expect(screen.getByText(/Weight went from 76\.2 kg to 80\.0 kg/)).toBeInTheDocument();
    // Each option carries its metric's pixel icon; the name stays the visible label.
    expect(screen.getByRole('radio', { name: 'Body fat' }).querySelector('svg.lu-pixel-icon')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Body fat' }));
    expect(screen.getByText(/Body fat went from 14\.6% to 8\.0%/)).toBeInTheDocument();
    expect(screen.getByTestId('trend-score')).toBeInTheDocument();
  });

  it('the chart points work from the keyboard: arrow keys move between scans', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    await screen.findByTestId('chart-trend');
    const last = screen.getByTestId('chart-trend-point-5');
    expect(last).toHaveAttribute('tabindex', '0');
    expect(last).toHaveAccessibleName(/Weight 80\.0 kg/);
    last.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('chart-trend-point-4')).toHaveFocus();
    expect(screen.getByTestId('chart-trend-tip')).toHaveTextContent('Weight 79.3 kg');
  });

  it('steps back to an earlier scan and compares it with the one before', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    expect(screen.getByTestId('scan-newer')).toBeDisabled();
    // The newest scan is tagged Latest, with how long ago it was taken.
    expect(screen.getByTestId('scan-latest')).toHaveTextContent('Latest');
    expect(screen.getByTestId('scan-age')).toHaveTextContent(/^(Today|Yesterday|\d+ (day|week|month|year)s? ago)$/);
    await userEvent.click(screen.getByRole('button', { name: 'Older scan' }));
    expect(screen.queryByTestId('scan-latest')).toBeNull();
    // Oct 15 is compared with the scan 4 weeks before it.
    expect(screen.getByTestId('compare-gap')).toHaveTextContent(/^\d+ (day|week|month)s? before$/);
    // The date is the title; only screen readers hear Scan 5 of 6.
    expect(screen.getByTestId('scan-title')).toHaveTextContent('Oct 15, 2026');
    expect(screen.getByTestId('scan-date')).toHaveTextContent('Scan 5 of 6');
    expect(screen.getByTestId('metric-weight')).toHaveTextContent(/79\.3\s?kg/);
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Older scan' }));
    expect(screen.getByTestId('scan-older')).toBeDisabled();
    expect(screen.getByTestId('change-weight')).toHaveTextContent('Your first scan');
  });

  it('View all scans lists every scan and opens the one tapped', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    await userEvent.click(screen.getByRole('button', { name: 'All scans (6)' }));
    const rows = await screen.findAllByTestId('scan-row');
    // Five to a page; the pager shows because there are six.
    expect(rows).toHaveLength(5);
    expect(screen.getByTestId('pager')).toHaveTextContent('Page 1 of 2');
    expect(rows[0]).toHaveAttribute('aria-current', 'true');
    await userEvent.click(rows[2]);
    expect(screen.getByTestId('scan-date')).toHaveTextContent('Scan 4 of 6');
  });

  it('every measurement has an info button that explains it', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    expect(screen.getAllByRole('button', { name: /^About / })).toHaveLength(9);
    await userEvent.click(screen.getByRole('button', { name: 'About Visceral fat' }));
    const dialog = screen.getByTestId('metric-info');
    expect(dialog).toHaveTextContent('Fat stored deep in your belly');
    expect(dialog).toHaveTextContent('What to do');
    expect(screen.getByTestId('metric-info-value')).toHaveTextContent('3');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.getByTestId('metric-info')).not.toHaveTextContent('Fat stored deep');
  });

  it('the body composition cards read the scan like an InBody sheet', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    const bc = await screen.findByTestId('body-comp');
    const weight = within(bc).getByTestId('bar-weight');
    expect(weight).toHaveTextContent(/80\.0\s?kg/);
    expect(weight).toHaveTextContent('Normal');
    // 41.3 kg of muscle is over the 31.6–38.6 kg band for 183 cm: good news, shown as Over.
    expect(within(bc).getByTestId('bar-smm')).toHaveTextContent('Over');
    // 8% body fat is under the men's 10–20% band.
    expect(within(bc).getByTestId('bar-pbf')).toHaveTextContent(/8\.0%.*Under/);
    // Compared with the scan before by default: muscle up is green.
    expect(within(bc).getByTestId('bar-smm-delta')).toHaveTextContent('+0.9 kg');
    expect(within(bc).getByTestId('bar-smm-delta')).toHaveClass('text-success');
    expect(within(bc).getByTestId('compare-legend')).toBeInTheDocument();
    // Body parts: muscle by default, fat a tap away.
    const segs = within(bc).getByTestId('segments');
    expect(within(segs).getByTestId('seg-rightArm')).toHaveTextContent(/kg/);
    // The hologram tints each part by its zone; it is decorative, the callouts carry the values.
    const figure = within(segs).getByTestId('segments-figure');
    expect(figure).toHaveAttribute('aria-hidden', 'true');
    expect(figure).toHaveAttribute('data-silhouette', 'MALE');
    expect(figure.querySelector('[data-part="rightArm"]')).toHaveAttribute('data-status', 'over');
    await userEvent.click(within(segs).getByRole('radio', { name: 'Fat' }));
    expect(within(segs).getByRole('radio', { name: 'Fat' })).toHaveAttribute('aria-checked', 'true');
    expect(within(segs).getByTestId('seg-trunk')).toHaveTextContent('Under');
    expect(figure.querySelector('[data-part="trunk"]')).toHaveAttribute('data-status', 'under');
  });

  it('draws the female silhouette for Nour’s scan', async () => {
    await renderAs('104', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    const figure = await screen.findByTestId('segments-figure');
    expect(figure).toHaveAttribute('data-silhouette', 'FEMALE');
    await userEvent.click(screen.getByRole('radio', { name: 'Fat' }));
    expect(figure).toHaveAttribute('data-silhouette', 'FEMALE');
    expect(figure).toHaveAttribute('data-view', 'fat');
  });

  it('compares the scan with any other scan, or with none', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    await screen.findByTestId('body-comp');
    await userEvent.click(screen.getByTestId('compare-open'));
    const picker = await screen.findByTestId('compare-picker');
    const rows = within(picker).getAllByTestId('scan-row');
    // The compare sheet fits fewer rows than the list (it has a hint and a Don't compare row): 4 at this height.
    expect(rows).toHaveLength(4);
    expect(rows[0]).toBeDisabled(); // the scan on screen
    expect(rows[1]).toHaveAttribute('aria-current', 'true'); // the scan before, by default
    // The first scan is the last row of page 2.
    await userEvent.click(within(picker).getByRole('button', { name: 'Next page' }));
    const page2 = within(picker).getAllByTestId('scan-row');
    expect(page2).toHaveLength(2);
    await userEvent.click(page2[1]);
    // Now every change is since the first scan: 36.4 → 41.3 kg of muscle.
    expect(screen.getByTestId('change-muscle')).toHaveTextContent('▲ 4.9 kg');
    expect(screen.getByTestId('bar-smm-delta')).toHaveTextContent('+4.9 kg');
    await userEvent.click(screen.getByTestId('compare-open'));
    await userEvent.click(await screen.findByTestId('compare-none'));
    expect(screen.getByTestId('change-caption')).toHaveTextContent('No scan');
    expect(screen.queryByTestId('bar-smm-delta')).toBeNull();
    expect(screen.queryByTestId('compare-legend')).toBeNull();
    expect(screen.getByTestId('change-muscle')).toHaveTextContent('');
  });

  it('Lina sees the empty state', async () => {
    await renderAs('102', Progress);
    expect(await screen.findByText('No scans yet. Book one at the front desk.')).toBeInTheDocument();
  });

  it('Omar (one scan, FitScore hidden) sees when changes and trends will appear, and no FitScore trend', async () => {
    await renderAs('103', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    expect(await screen.findByText('Your trends appear after your second scan.')).toBeInTheDocument();
    expect(screen.getByTestId('change-weight')).toHaveTextContent('After 2nd scan');
    expect(screen.queryByTestId('trend-score')).toBeNull();
  });
});

describe('Goals', () => {
  it('shows every goal on one page: in progress, then completed; nothing up next', async () => {
    await renderAs('101', Goals);
    await screen.findByTestId('section-active');
    expect(screen.queryByTestId('journey')).toBeNull();
    expect(within(screen.getByTestId('section-active')).getAllByTestId('goal')).toHaveLength(2);
    expect(screen.queryByTestId('section-upcoming')).toBeNull();
    expect(within(screen.getByTestId('section-completed')).getAllByTestId('goal')).toHaveLength(2);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['In progress 2', 'Completed 2']);
  });

  it('an active goal shows percent, kg done of total, and its bar', async () => {
    await renderAs('101', Goals);
    const [goal] = within(await screen.findByTestId('section-active')).getAllByTestId('goal');
    expect(goal).toHaveTextContent('Gain 3 kg of muscle');
    expect(within(goal).getByTestId('goal-percent')).toHaveTextContent('67%');
    expect(within(goal).getByTestId('goal-meta')).toHaveTextContent('2.0 of 3.0 kg done');
    expect(within(goal).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
    // Start at the bar's beginning, target at its end: nothing to open.
    expect(within(goal).getByTestId('goal-stats')).toHaveTextContent(/Start 39\.3 kg.*Target 42\.3 kg/);
    expect(within(goal).queryByRole('button')).toBeNull();
  });

  it('completed goals keep a full bar and no date', async () => {
    await renderAs('101', Goals);
    const done = within(await screen.findByTestId('section-completed')).getAllByTestId('goal');
    expect(done[0]).toHaveTextContent('Goal reached');
    // A scan's date is when the member was measured, not when the goal was met.
    expect(done[0]).not.toHaveTextContent(/Completed |2026/);
    expect(within(done[0]).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('cards show no due date and no coach note', async () => {
    await renderAs('101', Goals);
    await screen.findByTestId('section-active');
    expect(screen.queryByText(/Due /)).toBeNull();
    expect(screen.queryByText('Keep protein high on training days.')).toBeNull();
  });

  it('Lina, with no goals, sees one empty state', async () => {
    await renderAs('102', Goals);
    expect(await screen.findByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.queryByTestId('journey')).toBeNull();
    expect(screen.getByTestId('goal-new-empty')).toHaveTextContent('Set your first goal');
  });

  it('always offers a New goal button in the header', async () => {
    await renderAs('101', Goals);
    expect(await screen.findByTestId('goal-new')).toHaveTextContent('New goal');
  });
});

describe('New goal', () => {
  const mock = <T,>(path: string, fitId: string) =>
    mockServer.handle('GET', path, null, `mock.${fitId}`).then((r) => r.body as T);

  it('Omar sets a muscle goal himself: what and how much, and it starts now', async () => {
    const [scan] = await mock<AssessmentDto[]>('/me/assessments', '103');
    await renderAs('103', NewGoal);
    await userEvent.click(await screen.findByTestId('goal-type-MUSCLE_KG'));
    expect(screen.getByTestId('goal-type-MUSCLE_KG')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('goal-amount')).toHaveTextContent('2');
    await userEvent.click(screen.getByTestId('goal-more'));
    expect(screen.getByTestId('goal-amount')).toHaveTextContent('2.5');
    expect(screen.getByTestId('goal-name')).toHaveTextContent('Gain 2.5 kg of muscle');
    expect(screen.queryByText('By when?')).toBeNull();
    expect(await screen.findByTestId('goal-starts')).toHaveTextContent('Starts today');

    await userEvent.click(screen.getByTestId('goal-create'));
    await waitFor(async () => {
      const goals = await mock<GoalsDto>('/me/goals', '103');
      expect(goals.active).toHaveLength(1);
      expect(goals.active[0]).toMatchObject({
        title: 'Gain 2.5 kg of muscle',
        metric: 'MUSCLE_KG',
        targetValue: Math.round((scan.skeletalMuscleKg + 2.5) * 10) / 10,
      });
    });
  });

  it('a fat goal cannot go below half a kilo, and starts today even with others in progress', async () => {
    await renderAs('101', NewGoal);
    const less = await screen.findByTestId('goal-less');
    for (let i = 0; i < 4; i++) if (!(less as HTMLButtonElement).disabled) await userEvent.click(less);
    expect(screen.getByTestId('goal-amount')).toHaveTextContent('0.5');
    expect(less).toBeDisabled();
    expect(screen.getByTestId('goal-starts')).toHaveTextContent('Starts today');
  });

  it('a weight goal steps the target and skips the current weight', async () => {
    await renderAs('103', NewGoal);
    await userEvent.click(await screen.findByTestId('goal-type-WEIGHT_KG'));
    expect(screen.getByTestId('goal-name')).toHaveTextContent(/^Reach [\d.]+ kg$/);
    expect(screen.getByTestId('goal-change')).toHaveTextContent(/from your last scan/);
  });

  it('Lina, with no scan, is told to book one and has a way back', async () => {
    await renderAs('102', NewGoal);
    expect(await screen.findByTestId('new-goal-no-scan')).toHaveTextContent('You need a body scan');
    expect(screen.getByTestId('new-goal-back')).toBeInTheDocument();
    expect(screen.queryByTestId('goal-create')).toBeNull();
  });

  it('reads in Egyptian Arabic', async () => {
    await setLanguage('ar');
    await renderAs('103', NewGoal);
    expect(await screen.findByText('عايز تعمل إيه؟')).toBeInTheDocument();
    expect(screen.getByTestId('goal-create')).toHaveTextContent('اعمل الهدف');
  });
});

describe('Leaderboard', () => {
  it('Top Score shows medals for the top 3 and highlights Mohamed', async () => {
    await renderAs('101', Leaderboard);
    const mine = await screen.findByTestId('my-row');
    expect(mine).toHaveTextContent('Mohamed O.');
    expect(mine).toHaveTextContent('you');
    const podium = screen.getByTestId('podium');
    expect(podium.querySelectorAll('[data-crop="full"]')).toHaveLength(3);
    expect(podium.querySelector('.lu-medal-1')).not.toBeNull();
    expect(screen.getByTestId('my-rank')).toHaveTextContent('#1');
    expect(screen.getByText("Men's rankings")).toBeInTheDocument();
  });

  it('formats each board and remembers the last one', async () => {
    await renderAs('101', Leaderboard);
    await screen.findByTestId('my-row');
    await userEvent.click(screen.getByTestId('board-bodyFat'));
    await waitFor(() => expect(screen.getByTestId('my-row')).toHaveTextContent('8.0%'));
    expect((await Preferences.get({ key: 'lu.board' })).value).toBe('bodyFat');
    await userEvent.click(screen.getByTestId('board-muscle'));
    await waitFor(() => expect(screen.getByTestId('my-row')).toHaveTextContent('41.3 kg'));
  });

  it('Lina sees the Join banner; joining with no scan explains why she is not listed', async () => {
    await renderAs('102', Leaderboard);
    const banner = await screen.findByTestId('join-banner');
    expect(banner).toHaveTextContent('Your FitScore is hidden from the leaderboard.');
    await userEvent.click(within(banner).getByRole('button', { name: 'Join' }));
    expect(await screen.findByTestId('no-scan-note')).toHaveTextContent("You'll appear here after your first scan.");
    expect(screen.queryByTestId('join-banner')).toBeNull();
    expect(screen.queryByTestId('my-row')).toBeNull();
  });
});

describe('Community', () => {
  it('uses decorative guests to fill a sparse gym and puts only ranked members on the wall board', async () => {
    const handle = mockServer.handle.bind(mockServer);
    vi.spyOn(mockServer, 'handle').mockImplementation(async (...args) => {
      const response = await handle(...args);
      if (!args[1].startsWith('/leaderboard?')) return response;
      const board = response.body as LeaderboardDto;
      return { ...response, body: { ...board, rows: board.rows.slice(0, 2) } };
    });

    await renderAs('101', Community);
    const gym = within(screen.getByRole('region', { name: 'Community gym' }));
    expect(await gym.findAllByTestId('community-member')).toHaveLength(1);
    expect(gym.getAllByTestId('community-guest')).toHaveLength(22);
    expect(gym.getByRole('button')).toHaveAccessibleName(
      gym.getByTestId('community-member').getAttribute('aria-label'),
    );
    const board = within(gym.getByTestId('community-wall-board'));
    expect(board.getByRole('link', { name: 'Leaderboards' })).toBeInTheDocument();
    expect(board.getAllByTestId('community-board-portrait')).toHaveLength(2);
    expect(board.getAllByTestId('community-board-portrait')[0]).toHaveAttribute('title', 'Mohamed O.');
  });

  it('fills the first room before paging to any remaining ranked members', async () => {
    const handle = mockServer.handle.bind(mockServer);
    vi.spyOn(mockServer, 'handle').mockImplementation(async (...args) => {
      const response = await handle(...args);
      if (!args[1].startsWith('/leaderboard?')) return response;
      const board = response.body as LeaderboardDto;
      const extra = board.rows.slice(1, 7).map((row, index) => ({
        ...row,
        memberId: 200 + index,
        rank: board.rows.length + index + 1,
      }));
      return { ...response, body: { ...board, rows: [...board.rows, ...extra] } };
    });

    await renderAs('101', Community);
    expect(await screen.findAllByTestId('community-member')).toHaveLength(23);
    expect(screen.queryAllByTestId('community-guest')).toHaveLength(0);
    const first = screen.getAllByTestId('community-member')[0];
    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-pressed', 'true');
    const pager = within(screen.getByRole('navigation', { name: 'Gym rooms' }));
    await userEvent.click(pager.getByRole('button', { name: 'Next page' }));
    expect(screen.getAllByTestId('community-member')).toHaveLength(1);
    expect(screen.queryByTestId('community-card')).not.toBeInTheDocument();
  });
});

describe('Profile', () => {
  it('shows the member identity, avatar, age, height, and earned medals', async () => {
    await renderAs('101', Profile);
    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Mohamed Omran');
    expect(screen.getByText('Fit ID 101')).toBeInTheDocument();
    expect(screen.getByTestId('profile-age')).toHaveTextContent(/\d+ years/);
    expect(screen.getByTestId('profile-height')).toHaveTextContent(/\d+.* cm/);
    expect(screen.getByTestId('profile-avatar')).toHaveAttribute('data-crop', 'full');
    const medals = await screen.findByTestId('profile-medal-grid');
    expect(within(medals).getAllByRole('listitem')).toHaveLength(10);
    expect(within(medals).getByTestId('profile-medal-plank')).toHaveTextContent('Gold');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/tabs/profile/settings');
    expect(screen.queryByText('Rami Saad')).toBeNull();
    expect(screen.queryByText(/Premium/)).toBeNull();
  });

  it('shows the no-medals state for a new member', async () => {
    await renderAs('102', Profile);
    const medals = await screen.findByTestId('profile-medal-grid');
    expect(await screen.findByTestId('profile-medal-count')).toHaveTextContent('Medals earned in 0 of 10 categories');
    expect(within(medals).getAllByRole('button')).toHaveLength(10);
    expect(within(medals).getByTestId('profile-medal-plank')).toHaveAttribute('data-unlocked', 'false');
  });
});

describe('Settings', () => {
  it('the two FitScore settings save independently', async () => {
    await renderAs('101', Settings);
    const show = await screen.findByTestId('setting-show-fitscore');
    await userEvent.click(show);
    await waitFor(async () => {
      const me = await mockServer.handle('GET', '/me', null, 'mock.101');
      expect(me.body).toMatchObject({ showFitScore: false, fitScoreOnLeaderboard: true });
    });
    expect(show).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('setting-leaderboard')).toHaveAttribute('aria-checked', 'true');
  });

  it('a failed save flips the switch back and says so', async () => {
    await renderAs('101', Settings);
    const lb = await screen.findByTestId('setting-leaderboard');
    vi.spyOn(mockServer, 'handle').mockResolvedValueOnce({ status: 500, body: null });
    await userEvent.click(lb);
    await waitFor(() => expect(lb).toHaveAttribute('aria-checked', 'true'));
  });

  it('switching language to Arabic flips the whole app', async () => {
    await renderAs('101', Settings);
    const lang = await screen.findByTestId('setting-language');
    await userEvent.click(within(lang).getByRole('radio', { name: 'عربي' }));
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    expect(screen.getByText('الإعدادات')).toBeInTheDocument();
  });
});
