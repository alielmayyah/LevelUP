import { Preferences } from '@capacitor/preferences';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockServer, resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import { features } from '../features';
import Dashboard from './Dashboard';

const NOW = new Date('2026-11-13T10:00:00Z');

const renderHome = async (fitId = '101') => {
  await setToken(`mock.${fitId}`);
  render(
    <MemoryRouter initialEntries={['/tabs/home']}>
      <Route exact path="/tabs/home" component={Dashboard} />
      <Route path="/tabs/community/leaderboard" render={() => <p>leaderboard page</p>} />
      <Route path="/tabs/goals/new" render={() => <p>new goal page</p>} />
    </MemoryRouter>,
  );
  return screen.findByTestId('mission-card');
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
    // The tiers live in the info sheet now, not on the card.
    expect(within(card).queryByTestId('tier-meter')).toBeNull();
    expect(within(card).queryByText('Private')).toBeNull();
  });

  it('the info button explains FitScore, its five tiers, and who sees it', async () => {
    await renderHome();
    await userEvent.click(screen.getByRole('button', { name: 'About FitScore' }));
    const sheet = screen.getByTestId('fitscore-info');
    expect(within(sheet).getByRole('heading', { name: 'What is FitScore?' })).toBeInTheDocument();
    expect(sheet).toHaveTextContent(/0 to 100/);
    const tiers = within(within(sheet).getByTestId('fitscore-tiers')).getAllByRole('listitem');
    expect(tiers.map((li) => li.textContent)).toEqual([
      expect.stringMatching(/^Elite.*80 and up$/),
      'Strong70 to 79',
      'On Track60 to 69',
      'Building50 to 59',
      'Getting startedUnder 50',
    ]);
    // Mohamed is Elite: his row is marked.
    expect(tiers[0]).toHaveAttribute('aria-current', 'true');
    expect(tiers[0]).toHaveTextContent("You're here");
    expect(sheet).toHaveTextContent('How to raise it');
    expect(sheet).toHaveTextContent('Only you can see it.');
    await userEvent.click(within(sheet).getByRole('button', { name: 'Close' }));
    expect(within(screen.getByTestId('fitscore-info')).queryByText('What is FitScore?')).toBeNull();
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
    expect(card).toHaveTextContent('1.0 kg to go');
    // Read out in full, drawn only as the ring and what is left.
    expect(within(card).getByText('2.0 of 3.0 kg')).toHaveClass('sr-only');
    expect(within(card).queryByTestId('mission-amount')).toBeNull();
    expect(card.querySelector('.lu-bar')).toBeNull();
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
    // Good or bad is said in words too, not by color alone.
    expect(screen.getByTestId('tile-body-fat')).toHaveTextContent('Good progress');
    expect(screen.queryByTestId('wins-empty')).toBeNull();
  });

  it('a new member sees empty states with a next step, never dashes', async () => {
    await renderHome('102');
    expect(await screen.findByText('Your FitScore appears after your first scan.')).toBeInTheDocument();
    expect(screen.getByText('Book your first scan at the front desk.')).toBeInTheDocument();
    if (features.community) expect(screen.getByText('Join the FitScore leaderboard')).toBeInTheDocument();
    else expect(screen.queryByTestId('rank-card')).toBeNull();
    expect(screen.getByTestId('wins-empty')).toHaveTextContent(
      'No scan this month yet. Your wins show after your next scan.',
    );
    expect(screen.queryByTestId('tile-body-fat')).toBeNull();
    expect(screen.getByTestId('page-body')).not.toHaveTextContent('—');
    expect(screen.queryByTestId('bell-dot')).toBeNull();
  });

  it('with no goal, the whole mission card opens New goal', async () => {
    await renderHome('102');
    const card = await screen.findByRole('button', { name: /Set your first goal/ });
    expect(card).toHaveAttribute('data-testid', 'mission-card');
    await userEvent.click(card);
    expect(await screen.findByText('new goal page')).toBeInTheDocument();
  });

  it('hides the FitScore card when the member turned it off', async () => {
    await renderHome('103');
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
    expect(screen.getByRole('button', { name: 'عن الـ FitScore' })).toBeInTheDocument();
    expect(screen.getByText('دهون الجسم')).toBeInTheDocument();
  });
});
