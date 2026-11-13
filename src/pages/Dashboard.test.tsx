import { Preferences } from '@capacitor/preferences';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockServer, resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import Dashboard from './Dashboard';

const NOW = new Date('2026-11-13T10:00:00Z');

const renderHome = async (fitId = '101') => {
  await setToken(`mock.${fitId}`);
  render(
    <MemoryRouter initialEntries={['/tabs/home']}>
      <Route exact path="/tabs/home" component={Dashboard} />
      <Route path="/tabs/leaderboard" render={() => <p>leaderboard page</p>} />
      <Route path="/tabs/profile" render={() => <p>profile page</p>} />
    </MemoryRouter>,
  );
  return screen.findByTestId('fitscore-card').catch(() => screen.findByTestId('rank-card'));
};

describe('Home', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(NOW);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await setLanguage('en');
  });

  it("greets Sam by name with today's date", async () => {
    await renderHome();
    expect(screen.getByTestId('greeting')).toHaveTextContent(/Sam/);
    expect(screen.getByTestId('today').textContent).not.toBe('');
  });

  it("shows Sam's FitScore, tier, and change", async () => {
    await renderHome();
    const card = screen.getByTestId('fitscore-card');
    expect(within(card).getByTestId('fitscore-value')).toHaveTextContent('72');
    expect(within(card).getByText('Strong')).toBeInTheDocument();
    expect(within(card).getByTestId('fitscore-change')).toHaveTextContent(/\+3/);
    expect(within(card).getByText('Private')).toBeInTheDocument();
    // Strong is the 4th of 5 tiers: 4 blocks lit, the 4th marked current.
    const blocks = within(card).getByTestId('tier-meter').children;
    expect([...blocks].filter((b) => b.classList.contains('is-on'))).toHaveLength(4);
    expect(blocks[3]).toHaveClass('is-current');
  });

  it('shows rank, top percent, and the nudge; tapping opens the leaderboard', async () => {
    await renderHome();
    const card = screen.getByTestId('rank-card');
    expect(within(card).getByTestId('rank-number')).toHaveTextContent(/#4⁩ of 13/);
    expect(card).toHaveTextContent(/Top ⁦\d+%⁩/); // isolated so Arabic keeps the % in place
    expect(card).toHaveTextContent('9 members behind you');
    expect(card).toHaveTextContent(/\d+ points to reach/);
    await userEvent.click(card);
    expect(await screen.findByText('leaderboard page')).toBeInTheDocument();
  });

  it("shows Sam's current mission with progress", async () => {
    await renderHome();
    const card = screen.getByTestId('mission-card');
    expect(card).toHaveTextContent('Lose 5 kg of body fat');
    expect(card).toHaveTextContent('60%');
    expect(card).toHaveTextContent('3.0 of 5.0 kg');
    // The coach's note is not on Home (it is in the goal's details on the Goals tab).
    expect(screen.queryByText('Keep protein high on training days.')).toBeNull();
  });

  it('colors the monthly tiles and shows the join date', async () => {
    await renderHome();
    expect(screen.getByTestId('tile-body-fat')).toHaveClass('lu-tile-good');
    expect(screen.getByTestId('tile-body-fat')).toHaveTextContent('−1.2%');
    expect(screen.getByTestId('tile-muscle')).toHaveClass('lu-tile-good');
    expect(screen.getByTestId('tile-muscle')).toHaveTextContent('+0.8 kg');
    expect(screen.getByTestId('tile-member-since')).toHaveTextContent('Mar 2026');
  });

  it('a new member sees the empty FitScore, the join prompt, and dashes', async () => {
    await renderHome('102');
    expect(await screen.findByText('Your FitScore appears after your first scan.')).toBeInTheDocument();
    expect(screen.getByText('Join the FitScore leaderboard')).toBeInTheDocument();
    expect(screen.getByText('No active mission. Your coach will set one soon.')).toBeInTheDocument();
    expect(screen.getByTestId('tile-body-fat')).toHaveTextContent('—');
    expect(screen.queryByTestId('bell-dot')).toBeNull();
    await userEvent.click(screen.getByTestId('rank-card'));
    expect(await screen.findByText('profile page')).toBeInTheDocument();
  });

  it('hides the FitScore card when the member turned it off', async () => {
    await renderHome('103');
    await screen.findByTestId('rank-card');
    expect(screen.queryByTestId('fitscore-card')).toBeNull();
  });

  it('the bell announces unread notifications', async () => {
    await renderHome();
    expect(screen.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument();
    expect(screen.getByTestId('bell-dot')).toBeInTheDocument();
  });

  it('shows an error with Retry when the dashboard fails to load', async () => {
    const handle = mockServer.handle.bind(mockServer);
    const spy = vi.spyOn(mockServer, 'handle').mockResolvedValueOnce({ status: 500, body: null });
    await setToken('mock.101');
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Couldn't load your dashboard.")).toBeInTheDocument();
    spy.mockImplementation(handle);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('fitscore-card')).toBeInTheDocument();
  });

  it('renders Egyptian Arabic copy', async () => {
    await setLanguage('ar');
    await renderHome();
    expect(screen.getByTestId('greeting')).toHaveTextContent(/Sam/);
    expect(screen.getByText('خاص')).toBeInTheDocument();
    expect(screen.getByText('دهون الجسم')).toBeInTheDocument();
  });
});
