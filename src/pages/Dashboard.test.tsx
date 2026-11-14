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

  it("greets Mohamed by name with today's date", async () => {
    await renderHome();
    expect(screen.getByTestId('greeting')).toHaveTextContent(/Mohamed/);
    expect(screen.getByTestId('today').textContent).not.toBe('');
  });

  it("shows Mohamed's FitScore, tier, and change", async () => {
    await renderHome();
    const card = screen.getByTestId('fitscore-card');
    expect(within(card).getByTestId('fitscore-value')).toHaveTextContent('91');
    expect(within(card).getByText('Elite')).toBeInTheDocument();
    expect(within(card).getByTestId('fitscore-change')).toHaveTextContent(/\+2/);
    expect(within(card).getByText('Private')).toBeInTheDocument();
    // Elite is the top tier: all 5 blocks lit, the 5th marked current.
    const blocks = within(card).getByTestId('tier-meter').children;
    expect([...blocks].filter((b) => b.classList.contains('is-on'))).toHaveLength(5);
    expect(blocks[4]).toHaveClass('is-current');
  });

  it('shows rank, top percent, and the nudge; tapping opens the leaderboard', async () => {
    await renderHome();
    const card = screen.getByTestId('rank-card');
    expect(within(card).getByTestId('rank-number')).toHaveTextContent(/#1⁩ of 19/);
    expect(card).toHaveTextContent(/Top ⁦\d+%⁩/); // isolated so Arabic keeps the % in place
    expect(card).toHaveTextContent('18 members behind you');
    expect(card).toHaveTextContent("You're #1, defend it!");
    await userEvent.click(card);
    expect(await screen.findByText('leaderboard page')).toBeInTheDocument();
  });

  it("shows Mohamed's current mission with progress", async () => {
    await renderHome();
    const card = screen.getByTestId('mission-card');
    expect(card).toHaveTextContent('Gain 3 kg of muscle');
    expect(card).toHaveTextContent('67%');
    expect(card).toHaveTextContent('2.0 of 3.0 kg');
    // The coach's note is not on Home (it is in the goal's details on the Goals tab).
    expect(screen.queryByText('Keep protein high on training days.')).toBeNull();
  });

  it('colors the monthly tiles and shows the BMI change', async () => {
    await renderHome();
    expect(screen.getByTestId('tile-body-fat')).toHaveClass('lu-tile-good');
    expect(screen.getByTestId('tile-body-fat')).toHaveTextContent('−1.1%');
    expect(screen.getByTestId('tile-muscle')).toHaveClass('lu-tile-good');
    expect(screen.getByTestId('tile-muscle')).toHaveTextContent('+0.9 kg');
    expect(screen.getByTestId('tile-bmi')).toHaveTextContent('BMI');
    expect(screen.getByTestId('tile-bmi')).toHaveTextContent(/[+−±]?\d+\.\d/);
    expect(screen.queryByTestId('tile-member-since')).toBeNull();
  });

  it('a new member sees the empty FitScore, the join prompt, and dashes', async () => {
    await renderHome('102');
    expect(await screen.findByText('Your FitScore appears after your first scan.')).toBeInTheDocument();
    expect(screen.getByText('Join the FitScore leaderboard')).toBeInTheDocument();
    expect(screen.getByText('No active mission. Set a goal to start one.')).toBeInTheDocument();
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
    expect(screen.getByTestId('greeting')).toHaveTextContent(/Mohamed/);
    expect(screen.getByText('خاص')).toBeInTheDocument();
    expect(screen.getByText('دهون الجسم')).toBeInTheDocument();
  });
});
