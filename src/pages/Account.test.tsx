import { Preferences } from '@capacitor/preferences';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import Account from './Account';

const NOW = new Date('2026-11-18T12:00:00Z');

const renderAs = async (fitId: string) => {
  await setToken(`mock.${fitId}`);
  render(
    <MemoryRouter>
      <Account />
    </MemoryRouter>,
  );
};

describe('Account', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(NOW);
  });
  afterEach(async () => {
    await setLanguage('en');
  });

  it('shows the member with initials, Fit ID, age and height', async () => {
    await renderAs('104');
    const profile = await screen.findByTestId('account-profile');
    expect(profile).toHaveTextContent('KM');
    expect(within(profile).getByTestId('account-name')).toHaveTextContent('Karim Mansour');
    expect(profile).toHaveTextContent('Fit ID 104');
    expect(within(profile).getByTestId('account-height')).toHaveTextContent('178.5 cm');
  });

  it('lists where they scan and what they have earned, with the next level as a body target', async () => {
    await renderAs('104');
    const places = await screen.findByTestId('account-places');
    expect(await within(places).findByText('Iron Box · New Cairo · InBody 770')).toBeInTheDocument();
    expect(places).toHaveTextContent('Scans: 3');
    const badges = await screen.findByTestId('account-badges');
    expect(within(badges).getByTestId('badge-first')).toHaveAttribute('data-earned', 'true');
    expect(within(badges).getByTestId('badge-level-3')).toHaveAttribute('data-earned', 'true');
    expect(within(badges).getByTestId('badge-next')).toHaveAttribute('data-earned', 'false');
  });

  it('links to goals, the old profile and settings', async () => {
    await renderAs('104');
    expect(await screen.findByTestId('account-goals')).toHaveAttribute('href', '/tabs/account/goals');
    expect(screen.getByTestId('account-character')).toHaveAttribute('href', '/tabs/account/profile');
    expect(screen.getByTestId('account-settings')).toHaveAttribute('href', '/tabs/account/settings');
  });

  it('a new member sees where their gym will show up, and no milestones yet', async () => {
    await renderAs('102');
    expect(await screen.findByTestId('account-places')).toHaveTextContent(
      'Your gym shows up here after your first scan.',
    );
    expect(screen.queryByTestId('account-badges')).toBeNull();
  });
});
