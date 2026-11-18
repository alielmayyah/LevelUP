import { Preferences } from '@capacitor/preferences';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockServer, resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import Dashboard from './Dashboard';

const NOW = new Date('2026-11-18T12:00:00Z');

const renderHome = async (fitId = '104') => {
  await setToken(`mock.${fitId}`);
  render(
    <MemoryRouter initialEntries={['/tabs/home']}>
      <Route exact path="/tabs/home" component={Dashboard} />
      <Route path="/tabs/scans" render={() => <p>scans page</p>} />
      <Route path="/tabs/account/goals/new" render={() => <p>new goal page</p>} />
    </MemoryRouter>,
  );
};

/** Strips the bidi isolates and no-break spaces that keep numbers and units together. */
const plain = (el: Element) => (el.textContent ?? '').replace(/[\u2066-\u2069]/g, '').replace(/\u00a0/g, ' ');

describe('Home', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(NOW);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await setLanguage('en');
  });

  it('greets the member and shows their initials, not an avatar', async () => {
    await renderHome();
    expect(await screen.findByText('Hello, Karim')).toHaveAttribute('data-testid', 'greeting');
    const initials = screen.getByTestId('home-initials');
    expect(initials).toHaveAccessibleName(/Open your account/);
    expect(initials).toHaveTextContent('K');
  });

  it('leads with the level, the verdict and the road', async () => {
    await renderHome();
    const hero = await screen.findByTestId('journey-hero');
    expect(within(hero).getByRole('img', { name: 'Level 3' })).toBeInTheDocument();
    expect(within(hero).getByTestId('verdict')).toHaveTextContent(
      'Your body has changed since your first scan: more muscle, less fat.',
    );
    expect(within(hero).getAllByTestId('road-stop')).toHaveLength(3);
    expect(within(hero).getByTestId('road-next')).toBeInTheDocument();
    expect(plain(within(hero).getByTestId('next-level'))).toBe('Next level: muscle +0.8 kg or fat −0.7 kg');
  });

  it('draws weight as fat + fat-free mass, with real changes in words', async () => {
    await renderHome();
    const body = await screen.findByTestId('home-body');
    expect(plain(within(body).getByTestId('weight-total'))).toBe('77.9 kg');
    expect(plain(within(body).getByTestId('weight-fat'))).toBe('14.9 kg');
    expect(plain(within(body).getByTestId('weight-lean'))).toBe('63.0 kg');
    const muscle = within(body).getByTestId('change-muscleKg');
    expect(muscle).toHaveAttribute('data-verdict', 'better');
    expect(muscle).toHaveTextContent('Improved');
    expect(plain(muscle)).toContain('+1.0 kg');
    expect(within(body).getByTestId('change-fatKg')).toHaveAttribute('data-verdict', 'better');
  });

  it('has exactly one primary button, which opens the scan report', async () => {
    await renderHome();
    await screen.findByTestId('home-body');
    expect(document.querySelectorAll('button[data-variant="primary"]')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'See your scan report' }));
    expect(await screen.findByText('scans page')).toBeInTheDocument();
  });

  it('shows the level-up milestone and the next scan with its conditions', async () => {
    await renderHome();
    expect(await screen.findByTestId('home-milestone')).toHaveTextContent('You reached level 3');
    const next = screen.getByTestId('home-next');
    expect(next).toHaveTextContent('Come 3 hours after eating');
    expect(next).toHaveTextContent('No workout before the scan');
  });

  it('a new member sees what to do first, never dashes or a goal before a scan', async () => {
    await renderHome('102');
    const empty = await screen.findByTestId('home-empty');
    expect(empty).toHaveTextContent('No scans yet');
    expect(empty).toHaveTextContent('Book your first InBody scan at the front desk.');
    expect(screen.getByTestId('page-body')).not.toHaveTextContent('—');
    expect(screen.queryByTestId('home-goal')).toBeNull();
    expect(screen.queryByTestId('bell-dot')).toBeNull();
  });

  it('one scan: level 1 and the first-scan milestone, no changes yet', async () => {
    await renderHome('103');
    const hero = await screen.findByTestId('journey-hero');
    expect(within(hero).getByRole('img', { name: 'Level 1' })).toBeInTheDocument();
    expect(within(hero).getByTestId('verdict')).toHaveAttribute('data-verdict', 'firstScan');
    expect(screen.queryByTestId('change-muscleKg')).toBeNull();
    expect(screen.getByTestId('home-milestone')).toHaveTextContent('The first stop on your journey');
  });

  it('with no goal yet, the goal card offers to set one', async () => {
    await renderHome('104');
    await userEvent.click(await screen.findByTestId('home-goal-set'));
    expect(await screen.findByText('new goal page')).toBeInTheDocument();
  });

  it('shows the active goal with its progress', async () => {
    await renderHome('101');
    const goal = await screen.findByTestId('home-goal');
    expect(goal).toHaveTextContent('Gain 3 kg of muscle');
    expect(within(goal).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
  });

  it('the bell announces unread notifications', async () => {
    await renderHome('101');
    expect(await screen.findByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument();
  });

  it('shows an error with Retry when the dashboard fails to load', async () => {
    const handle = mockServer.handle.bind(mockServer);
    const spy = vi.spyOn(mockServer, 'handle').mockResolvedValueOnce({ status: 500, body: null });
    await setToken('mock.104');
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('home-error')).toHaveTextContent(/load your dashboard/);
    spy.mockImplementation(handle);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('journey-hero')).toBeInTheDocument();
  });

  it('renders Egyptian Arabic copy, right to left', async () => {
    await setLanguage('ar');
    await renderHome();
    expect(await screen.findByTestId('verdict')).toHaveTextContent('جسمك اتغيّر من أول قياس: عضل أكتر ودهون أقل.');
    expect(document.documentElement.dir).toBe('rtl');
    expect(plain(screen.getByTestId('weight-total'))).toBe('77.9 كجم');
  });
});

describe('New-result reveal', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(NOW);
  });
  afterEach(async () => {
    await setLanguage('en');
  });

  it('the first open counts the latest scan as seen and plays nothing', async () => {
    await renderHome();
    await screen.findByTestId('journey-hero');
    await waitFor(async () => expect((await Preferences.get({ key: 'lu.seenScan' })).value).toBe('10'));
    expect(screen.queryByTestId('reveal')).toBeNull();
  });

  it('a scan the member has not seen plays the three beats once', async () => {
    await Preferences.set({ key: 'lu.seenScan', value: '9' });
    await renderHome();
    expect(await screen.findByTestId('reveal-verdict')).toHaveTextContent(
      'Your body has changed since your first scan: more muscle, less fat.',
    );
    await userEvent.click(screen.getByTestId('reveal-next'));
    expect(await screen.findByTestId('reveal-change')).toHaveTextContent('Fat');
    await userEvent.click(screen.getByTestId('reveal-next'));
    expect(await screen.findByTestId('reveal-milestone')).toHaveTextContent('You reached level 3');
    expect((await Preferences.get({ key: 'lu.seenScan' })).value).toBe('10');
  });
});
