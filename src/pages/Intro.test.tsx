import { Preferences } from '@capacitor/preferences';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { introSeen } from './intro/introSeen';
import Intro from './Intro';

const renderIntro = () =>
  render(
    <MemoryRouter initialEntries={['/intro']}>
      <Route exact path="/intro" component={Intro} />
      <Route exact path="/login" render={() => <p>login page</p>} />
    </MemoryRouter>,
  );

describe('Intro', () => {
  beforeEach(async () => {
    await Preferences.clear();
  });

  it('walks through three slides, then goes to login and never shows again', async () => {
    renderIntro();
    expect(screen.getByTestId('intro-slide-numbers')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('intro-next'));
    expect(screen.getByTestId('intro-slide-meaning')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('intro-next'));
    expect(screen.getByTestId('intro-slide-goals')).toBeInTheDocument();
    expect(screen.queryByTestId('intro-skip')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Get started' }));
    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(await introSeen()).toBe(true);
  });

  it('Skip goes straight to login', async () => {
    renderIntro();
    await userEvent.click(screen.getByTestId('intro-skip'));
    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(await introSeen()).toBe(true);
  });
});
