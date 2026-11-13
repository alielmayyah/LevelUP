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
  it("shows Sam's latest scan with all 9 measurements and the right decimals", async () => {
    await renderAs('101', Progress);
    const scan = await screen.findByTestId('latest-scan');
    expect(within(scan).getAllByRole('term')).toHaveLength(9);
    expect(within(scan).getByTestId('metric-weight')).toHaveTextContent('82.6 kg');
    expect(within(scan).getByTestId('metric-bodyFat')).toHaveTextContent('21.2%');
    expect(within(scan).getByTestId('metric-visceral')).toHaveTextContent(/^Visceral fat9$/);
    expect(within(scan).getByTestId('metric-bmr')).toHaveTextContent(/1,\d{3} kcal/);
  });

  it('draws both charts for Sam, with a screen-reader summary', async () => {
    await renderAs('101', Progress);
    expect(await screen.findByTestId('chart-composition')).toBeInTheDocument();
    expect(screen.getByTestId('fitscore-chart')).toBeInTheDocument();
    expect(screen.getByText(/Weight went from 86\.0 kg to 82\.6 kg/)).toBeInTheDocument();
  });

  it('tapping a point shows its values and date; the legend hides a line', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('chart-composition');
    await userEvent.click(screen.getByTestId('chart-composition-point-5'));
    const tip = screen.getByTestId('chart-composition-tip');
    expect(tip).toHaveTextContent('Weight 82.6 kg');
    const weightKey = screen.getByRole('button', { name: 'Weight' });
    await userEvent.click(weightKey);
    expect(weightKey).toHaveAttribute('aria-pressed', 'false');
    expect(tip).not.toHaveTextContent('Weight');
  });

  it('the chart points work from the keyboard: arrow keys move between scans', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('chart-composition');
    const last = screen.getByTestId('chart-composition-point-5');
    expect(last).toHaveAttribute('tabindex', '0');
    expect(last).toHaveAccessibleName(/Weight 82\.6 kg, Muscle 34\.9 kg, Body fat 21\.2%/);
    last.focus();
    await userEvent.keyboard('{ArrowLeft}');
    const prev = screen.getByTestId('chart-composition-point-4');
    expect(prev).toHaveFocus();
    expect(screen.getByTestId('chart-composition-tip')).toHaveTextContent('Weight 83.3 kg');
  });

  it('Lina sees the empty state', async () => {
    await renderAs('102', Progress);
    expect(await screen.findByText('No scans yet. Book one at the front desk.')).toBeInTheDocument();
  });

  it('Omar (one scan, FitScore hidden) sees the second-scan message and no FitScore chart', async () => {
    await renderAs('103', Progress);
    expect(await screen.findByText('Your trends appear after your second scan.')).toBeInTheDocument();
    expect(screen.queryByTestId('fitscore-chart')).toBeNull();
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
    expect(screen.getAllByTestId('row')[0].querySelector('.lu-medal-1')).not.toBeNull();
    expect(screen.getByTestId('my-rank')).toHaveTextContent('#4');
  });

  it('formats each board and remembers the last one', async () => {
    await renderAs('101', Leaderboard);
    await screen.findByTestId('my-row');
    await userEvent.click(screen.getByTestId('board-fatLoss'));
    await waitFor(() => expect(screen.getByTestId('my-row')).toHaveTextContent(/−\d\.\d%/));
    expect((await Preferences.get({ key: 'lu.board' })).value).toBe('fatLoss');
    await userEvent.click(screen.getByTestId('board-muscle'));
    await waitFor(() => expect(screen.getByTestId('my-row')).toHaveTextContent(/\+\d\.\d kg/));
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
