import { Preferences } from '@capacitor/preferences';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import Compare from './Compare';

const NOW = new Date('2026-11-18T12:00:00Z');

const renderAs = async (fitId: string) => {
  await setToken(`mock.${fitId}`);
  render(
    <MemoryRouter>
      <Compare />
    </MemoryRouter>,
  );
};

describe('Compare', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(NOW);
  });
  afterEach(async () => {
    await setLanguage('en');
  });

  it('latest vs the one before: same machine, every change inside the noise reads "about the same"', async () => {
    await renderAs('104');
    const last = await screen.findByTestId('compare-last');
    expect(within(last).getByTestId('compare-last-machine')).toHaveTextContent('Same machine');
    for (const k of ['muscleKg', 'fatKg', 'fatPct', 'weightKg']) {
      expect(within(last).getByTestId(`change-${k}`)).toHaveAttribute('data-verdict', 'same');
    }
    expect(within(last).getByTestId('compare-last-all-same')).toBeInTheDocument();
  });

  it('latest vs the first scan carries the real change', async () => {
    await renderAs('104');
    const first = await screen.findByTestId('compare-first');
    expect(within(first).getByTestId('change-muscleKg')).toHaveAttribute('data-verdict', 'better');
    expect(within(first).getByTestId('change-fatKg')).toHaveAttribute('data-verdict', 'better');
    expect(within(first).queryByTestId('compare-first-all-same')).toBeNull();
  });

  it('with one scan, says when Compare appears', async () => {
    await renderAs('103');
    expect(await screen.findByTestId('compare-need-two')).toHaveTextContent('Compare shows after your second scan');
  });
});
