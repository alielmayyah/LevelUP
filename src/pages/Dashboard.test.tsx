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

  it("shows Mohamed's FitScore number", async () => {
    await renderHome();
    const card = screen.getByTestId('fitscore-card');
    expect(within(card).getByTestId('fitscore-value')).toHaveTextContent('91');
  });

  it("shows Mohamed's current mission with progress", async () => {
    await renderHome();
    const card = screen.getByTestId('mission-card');
    expect(card).toHaveTextContent('Gain 3 kg of muscle');
    expect(card).toHaveTextContent('67%');
    expect(card).toHaveTextContent('1.0 kg to go');
    // Read out in full, drawn only as the big percentage, the bar and what is left.
    expect(within(card).getByText('2.0 of 3.0 kg')).toHaveClass('sr-only');
    expect(within(card).queryByTestId('mission-amount')).toBeNull();
    expect(within(card).getByTestId('mission-percent')).toHaveTextContent('67%');
    expect(card.querySelector('.lu-bar')).toHaveAttribute('aria-hidden', 'true');
  });

  it('a new member sees empty states with a next step, never dashes', async () => {
    await renderHome('102');
    expect(await screen.findByText('Your FitScore appears after your first scan.')).toBeInTheDocument();
    expect(screen.getByText('Book your first scan at the front desk.')).toBeInTheDocument();
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
    expect(screen.getByTestId('fitscore-value')).toHaveTextContent('91');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
