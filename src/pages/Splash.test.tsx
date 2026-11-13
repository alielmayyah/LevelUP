import { Preferences } from '@capacitor/preferences';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import { resetSound } from '../sound/useSound';
import Splash from './Splash';

const renderSplash = () =>
  render(
    <MemoryRouter initialEntries={['/splash']}>
      <Route exact path="/splash" component={Splash} />
      <Route exact path="/login" render={() => <p>login page</p>} />
      <Route path="/tabs/home" render={() => <p>home page</p>} />
    </MemoryRouter>,
  );

describe('Splash', () => {
  let audioPlay: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await Preferences.clear();
    resetSound();
    audioPlay = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    audioPlay.mockRestore();
    await setLanguage('en');
  });

  it('shows the app name, tagline, and call to action', () => {
    renderSplash();
    expect(screen.getByRole('heading', { name: 'LevelUP' })).toBeInTheDocument();
    expect(screen.getByText('Track. Improve. Transform.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tap to Begin' })).toBeInTheDocument();
  });

  it('tapping anywhere goes to login when signed out, with the tap sound', async () => {
    renderSplash();
    await userEvent.click(screen.getByTestId('page-splash'));
    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(audioPlay).toHaveBeenCalledTimes(1);
  });

  it('goes straight to home when already signed in', async () => {
    await setToken('mock.100001');
    renderSplash();
    await userEvent.click(screen.getByRole('button', { name: 'Tap to Begin' }));
    expect(await screen.findByText('home page')).toBeInTheDocument();
  });

  it('the sound toggle mutes without leaving the splash', async () => {
    renderSplash();
    await userEvent.click(screen.getByRole('button', { name: 'Mute sound' }));
    expect(screen.getByRole('button', { name: 'Unmute sound' })).toBeInTheDocument();
    expect(screen.queryByText('login page')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Tap to Begin' }));
    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(audioPlay).not.toHaveBeenCalled();
  });

  it('renders the Arabic copy', async () => {
    await setLanguage('ar');
    renderSplash();
    expect(screen.getByText('تابع. تطوّر. تحوّل.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'اضغط للبدء' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'كتم الصوت' })).toBeInTheDocument();
  });
});
