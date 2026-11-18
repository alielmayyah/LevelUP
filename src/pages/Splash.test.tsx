import { Preferences } from '@capacitor/preferences';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setToken } from '../auth/token';
import { brand } from '../brand.config';
import { setLanguage } from '../i18n';
import { markIntroSeen } from './intro/introSeen';
import Splash, { SPLASH_MS } from './Splash';

const renderSplash = (path = '/splash') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Route exact path="/splash" component={Splash} />
      <Route exact path="/intro" render={() => <p>intro page</p>} />
      <Route exact path="/login" render={() => <p>login page</p>} />
      <Route path="/tabs/home" render={() => <p>home page</p>} />
    </MemoryRouter>,
  );

/** Long enough for the splash to time out and navigate. */
const WAIT = { timeout: SPLASH_MS + 1500 };

describe('Splash', () => {
  beforeEach(async () => {
    await Preferences.clear();
  });

  afterEach(async () => {
    await setLanguage('en');
  });

  it('shows the app name and tagline, with nothing to tap', () => {
    renderSplash();
    expect(screen.getByRole('heading', { name: 'LevelUP' })).toHaveAccessibleDescription('Track. Improve. Transform.');
    expect(screen.getByRole('img', { name: 'LevelUP' })).toHaveAttribute('src', brand.logo);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('shows the intro slides on first launch when signed out', async () => {
    renderSplash();
    expect(await screen.findByText('intro page', {}, WAIT)).toBeInTheDocument();
  });

  it('moves on to login by itself when signed out and the intro was seen', async () => {
    await markIntroSeen();
    renderSplash();
    expect(screen.queryByText('login page')).toBeNull();
    expect(await screen.findByText('login page', {}, WAIT)).toBeInTheDocument();
  });

  it('moves on to home by itself when already signed in', async () => {
    await setToken('mock.101');
    renderSplash();
    expect(await screen.findByText('home page', {}, WAIT)).toBeInTheDocument();
  });

  it('?stay keeps it on screen', async () => {
    renderSplash('/splash?stay');
    await new Promise((r) => setTimeout(r, SPLASH_MS + 300));
    expect(screen.queryByText('login page')).toBeNull();
    expect(screen.queryByText('intro page')).toBeNull();
  });

  it('renders the Arabic copy', async () => {
    await setLanguage('ar');
    renderSplash();
    expect(screen.getByRole('heading', { name: 'LevelUP' })).toHaveAccessibleDescription('تابع. اتطوّر. اتغيّر.');
    expect(screen.getByRole('status', { name: 'بيحمّل' })).toBeInTheDocument();
  });
});
