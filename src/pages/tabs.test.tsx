/*
 * Progress, Goals, Leaderboard, and Profile against the mock API, for the
 * three mock members: 101 Sam (full), 102 Lina (new), 103 Omar (one scan,
 * FitScore hidden, membership ending soon).
 */
import { Preferences } from '@capacitor/preferences';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockServer, resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import { resetSound } from '../sound/useSound';
import Goals from './Goals';
import Leaderboard from './Leaderboard';
import Profile from './Profile';
import { ageOn } from './profile/age';
import Progress from './Progress';

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
  it("shows Sam's 3 key numbers with their change, and the other 6 under More", async () => {
    await renderAs('101', Progress);
    const scan = await screen.findByTestId('latest-scan');
    expect(within(scan).getAllByRole('term')).toHaveLength(3);
    const more = screen.getByTestId('more-metrics');
    expect(within(more).getAllByRole('term')).toHaveLength(6);
    expect(within(scan).getByTestId('metric-weight')).toHaveTextContent('82.6 kg');
    expect(within(scan).getByTestId('metric-bodyFat')).toHaveTextContent('21.2%');
    expect(within(more).getByTestId('metric-visceral')).toHaveTextContent(/^Visceral fat9/);
    expect(within(more).getByTestId('metric-bmr')).toHaveTextContent(/1,\d{3} kcal/);
    // Muscle up is good news (green), body fat down is good news (green), weight has no right way.
    expect(within(scan).getByText('Up 0.8 kg since the scan before').parentElement).toHaveClass('text-success');
    expect(within(scan).getByText('Down 1.2% since the scan before').parentElement).toHaveClass('text-success');
    expect(within(scan).getByText('Down 0.7 kg since the scan before').parentElement).toHaveClass('text-muted');
  });

  it('draws one trend at a time, with a screen-reader summary, and switches metric', async () => {
    await renderAs('101', Progress);
    expect(await screen.findByTestId('chart-trend')).toBeInTheDocument();
    expect(screen.getByText(/Weight went from 86\.0 kg to 82\.6 kg/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Body fat' }));
    expect(screen.getByText(/Body fat went from 26\.0% to 21\.2%/)).toBeInTheDocument();
    expect(screen.getByTestId('trend-score')).toBeInTheDocument();
  });

  it('the chart points work from the keyboard: arrow keys move between scans', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('chart-trend');
    const last = screen.getByTestId('chart-trend-point-5');
    expect(last).toHaveAttribute('tabindex', '0');
    expect(last).toHaveAccessibleName(/Weight 82\.6 kg/);
    last.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('chart-trend-point-4')).toHaveFocus();
    expect(screen.getByTestId('chart-trend-tip')).toHaveTextContent('Weight 83.3 kg');
  });

  it('steps back to an earlier scan and compares it with the one before', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    expect(screen.getByTestId('scan-newer')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Older scan' }));
    expect(screen.getByTestId('scan-title')).toHaveTextContent('Earlier scan');
    expect(screen.getByTestId('scan-date')).toHaveTextContent('scan 5 of 6');
    expect(screen.getByTestId('metric-weight')).toHaveTextContent('83.3 kg');
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Older scan' }));
    expect(screen.getByTestId('scan-older')).toBeDisabled();
    expect(screen.getByTestId('change-weight')).toHaveTextContent('Your first scan');
  });

  it('View all scans lists every scan and opens the one tapped', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    await userEvent.click(screen.getByRole('button', { name: 'All scans (6)' }));
    const rows = await screen.findAllByTestId('scan-row');
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveAttribute('aria-current', 'true');
    await userEvent.click(rows[2]);
    expect(screen.getByTestId('scan-date')).toHaveTextContent('scan 4 of 6');
  });

  it('every measurement has an info button that explains it', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    expect(screen.getAllByRole('button', { name: /^About / })).toHaveLength(9);
    await userEvent.click(screen.getByRole('button', { name: 'About Visceral fat' }));
    const dialog = screen.getByTestId('metric-info');
    expect(dialog).toHaveTextContent('Fat stored deep in your belly');
    expect(dialog).toHaveTextContent('What to do');
    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.getByTestId('metric-info')).not.toHaveTextContent('Fat stored deep');
  });

  it('Lina sees the empty state', async () => {
    await renderAs('102', Progress);
    expect(await screen.findByText('No scans yet. Book one at the front desk.')).toBeInTheDocument();
  });

  it('Omar (one scan, FitScore hidden) sees when changes and trends will appear, and no FitScore trend', async () => {
    await renderAs('103', Progress);
    expect(await screen.findByText('Your trends appear after your second scan.')).toBeInTheDocument();
    expect(screen.getByTestId('change-weight')).toHaveTextContent('After 2nd scan');
    expect(screen.queryByTestId('trend-score')).toBeNull();
  });
});

describe('Goals', () => {
  it('shows every goal on one page: journey, then in progress, up next, completed', async () => {
    await renderAs('101', Goals);
    const journey = await screen.findByTestId('journey');
    expect(journey).toHaveTextContent('2/4 goals done');
    expect(within(screen.getByTestId('section-active')).getAllByTestId('goal')).toHaveLength(1);
    expect(within(screen.getByTestId('section-upcoming')).getAllByTestId('goal')).toHaveLength(1);
    expect(within(screen.getByTestId('section-completed')).getAllByTestId('goal')).toHaveLength(2);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Your journey', 'In progress 1', 'Up next 1', 'Completed 2']);
  });

  it('an active goal shows percent, kg done of total, and its bar', async () => {
    await renderAs('101', Goals);
    const goal = within(await screen.findByTestId('section-active')).getByTestId('goal');
    expect(goal).toHaveTextContent('Lose 5 kg of body fat');
    expect(within(goal).getByTestId('goal-meta')).toHaveTextContent(/60%.*3\.0 \/ 5\.0 kg/);
    expect(within(goal).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  });

  it('completed goals keep a full bar and their date; upcoming ones say when they start', async () => {
    await renderAs('101', Goals);
    const done = within(await screen.findByTestId('section-completed')).getAllByTestId('goal');
    expect(done[0]).toHaveTextContent(/Completed /);
    expect(within(done[0]).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    const next = within(screen.getByTestId('section-upcoming')).getByTestId('goal');
    expect(next).toHaveTextContent('Starts after your current mission');
    expect(within(next).queryByRole('progressbar')).toBeNull();
  });

  it('tapping a goal opens its details: start → target, due date, and coach note', async () => {
    await renderAs('101', Goals);
    const goal = within(await screen.findByTestId('section-active')).getByTestId('goal');
    const toggle = within(goal).getByRole('button', { name: /Lose 5 kg of body fat/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(goal).queryByText(/Due /)).not.toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(goal).getByText(/Due /)).toBeVisible();
    expect(within(goal).getByText('Keep protein high on training days.')).toBeVisible();
  });

  it('Lina, with no goals, sees one empty state and no journey', async () => {
    await renderAs('102', Goals);
    expect(await screen.findByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.queryByTestId('journey')).toBeNull();
  });
});

describe('Leaderboard', () => {
  it('Top Score shows medals for the top 3 and highlights Sam', async () => {
    await renderAs('101', Leaderboard);
    const mine = await screen.findByTestId('my-row');
    expect(mine).toHaveTextContent('Sam K.');
    expect(mine).toHaveTextContent('you');
    const podium = screen.getByTestId('podium');
    expect(podium.querySelectorAll('[data-crop="full"]')).toHaveLength(3);
    expect(podium.querySelector('.lu-medal-1')).not.toBeNull();
    expect(screen.getByTestId('my-rank')).toHaveTextContent('#2');
    expect(screen.getByText("Men's rankings")).toBeInTheDocument();
  });

  it('formats each board and remembers the last one', async () => {
    await renderAs('101', Leaderboard);
    await screen.findByTestId('my-row');
    await userEvent.click(screen.getByTestId('board-bodyFat'));
    await waitFor(() => expect(screen.getByTestId('my-row')).toHaveTextContent('21.2%'));
    expect((await Preferences.get({ key: 'lu.board' })).value).toBe('bodyFat');
    await userEvent.click(screen.getByTestId('board-muscle'));
    await waitFor(() => expect(screen.getByTestId('my-row')).toHaveTextContent('34.9 kg'));
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

describe('Profile', () => {
  it("shows Sam's name, Fit ID, and personal details only (no membership or coach)", async () => {
    await renderAs('101', Profile);
    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Sam Khalil');
    expect(screen.getByText('Fit ID 101')).toBeInTheDocument();
    expect(screen.getByTestId('profile-age')).toHaveTextContent('32');
    expect(screen.queryByText('Rami Saad')).toBeNull();
    expect(screen.queryByText(/Premium/)).toBeNull();
  });

  it('the two FitScore settings save independently', async () => {
    await renderAs('101', Profile);
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
    await renderAs('101', Profile);
    const lb = await screen.findByTestId('setting-leaderboard');
    vi.spyOn(mockServer, 'handle').mockResolvedValueOnce({ status: 500, body: null });
    await userEvent.click(lb);
    await waitFor(() => expect(lb).toHaveAttribute('aria-checked', 'true'));
  });

  it('switching language to Arabic flips the whole app', async () => {
    await renderAs('101', Profile);
    const lang = await screen.findByTestId('setting-language');
    await userEvent.click(within(lang).getByRole('radio', { name: 'عربي' }));
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    expect(screen.getByText('بياناتك')).toBeInTheDocument();
  });

  it('computes age from the birth date', () => {
    expect(ageOn('1994-03-12T00:00:00Z', NOW)).toBe(32);
    expect(ageOn('1994-12-01T00:00:00Z', NOW)).toBe(31);
  });
});
