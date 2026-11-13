import { Preferences } from '@capacitor/preferences';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockServer, resetMockServer } from '../api/mock/server';
import { getToken, setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import { resetSound } from '../sound/useSound';
import Login from './Login';

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Route exact path="/login" component={Login} />
      <Route path="/tabs/home" render={() => <p>home page</p>} />
    </MemoryRouter>,
  );

const field = () => screen.getByLabelText('Fit ID');
const submit = () => screen.getByRole('button', { name: 'Sign in' });

describe('Login', () => {
  let audioPlay: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(new Date('2026-11-13T10:00:00Z'));
    resetSound();
    audioPlay = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    audioPlay.mockRestore();
    await setLanguage('en');
  });

  it('has one Fit ID field, no password, and a numeric keypad', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Welcome to LevelUP' })).toBeInTheDocument();
    expect(field()).toHaveAttribute('inputmode', 'numeric');
    expect(field()).toHaveAttribute('dir', 'ltr');
    expect(document.querySelector('input[type="password"]')).toBeNull();
    expect(screen.getByText("Ask the front desk if you don't have one.")).toBeInTheDocument();
  });

  it('keeps digits only, at most 8', async () => {
    renderLogin();
    await userEvent.type(field(), '12ab');
    expect(field()).toHaveValue('12');
    await userEvent.type(field(), '34567890');
    expect(field()).toHaveValue('12345678');
  });

  it('enables Sign in only from 3 digits', async () => {
    renderLogin();
    expect(submit()).toBeDisabled();
    await userEvent.type(field(), '10');
    expect(submit()).toBeDisabled();
    await userEvent.type(field(), '1');
    expect(submit()).toBeEnabled();
  });

  it('signs in a known member, stores the token, and plays the success sound', async () => {
    renderLogin();
    await userEvent.type(field(), '101');
    await userEvent.click(submit());
    expect(await screen.findByText('home page')).toBeInTheDocument();
    expect(await getToken()).toBe('mock.101');
    expect(audioPlay).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner and blocks a second press while signing in', async () => {
    const handle = mockServer.handle.bind(mockServer);
    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    const spy = vi.spyOn(mockServer, 'handle').mockImplementation(async (...args) => {
      await held;
      return handle(...args);
    });
    renderLogin();
    await userEvent.type(field(), '101{Enter}');
    const busy = await screen.findByRole('button', { name: 'Signing in…' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    await userEvent.type(field(), '{Enter}');
    release();
    expect(await screen.findByText('home page')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('shows "not found" for an unknown ID and keeps the value', async () => {
    renderLogin();
    await userEvent.type(field(), '999');
    await userEvent.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't find that Fit ID.");
    expect(field()).toHaveValue('999');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(await getToken()).toBeNull();
  });

  it('shows "too many tries" after repeated failures', async () => {
    renderLogin();
    await userEvent.type(field(), '999');
    for (let i = 0; i < 5; i++) {
      await userEvent.click(submit());
      await screen.findByText(/couldn't find/);
    }
    await userEvent.click(submit());
    expect(await screen.findByText('Too many tries. Wait a minute and try again.')).toBeInTheDocument();
  });

  it('does not play the success sound when muted', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Mute sound' }));
    await userEvent.type(field(), '101');
    await userEvent.click(submit());
    expect(await screen.findByText('home page')).toBeInTheDocument();
    expect(audioPlay).not.toHaveBeenCalled();
  });

  it('skips the form when already signed in', async () => {
    await setToken('mock.101');
    renderLogin();
    expect(await screen.findByText('home page')).toBeInTheDocument();
  });

  it('the language button switches to Arabic', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'ع: Switch to Arabic' }));
    expect(await screen.findByLabelText('رقم العضوية')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN: حوّل للإنجليزي' })).toBeInTheDocument();
  });

  it('renders the Arabic copy', async () => {
    await setLanguage('ar');
    renderLogin();
    expect(screen.getByLabelText('رقم العضوية')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('button', { name: 'ادخل' })).toBeInTheDocument();
  });
});
