import { Preferences } from '@capacitor/preferences';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('opens on the latest against the one before: same machine, all inside the noise', async () => {
    await renderAs('104');
    const result = await screen.findByTestId('compare-result');
    expect(within(result).getByTestId('compare-result-machine')).toHaveTextContent('Same machine');
    for (const k of ['muscleKg', 'fatKg', 'fatPct', 'weightKg']) {
      expect(within(result).getByTestId(`change-${k}`)).toHaveAttribute('data-verdict', 'same');
    }
    expect(within(result).getByTestId('compare-result-all-same')).toBeInTheDocument();
  });

  it('the first-scan shortcut shows the real change', async () => {
    await renderAs('104');
    await userEvent.click(await screen.findByTestId('compare-first-shortcut'));
    await screen.findByTestId('compare-result');
    expect(await screen.findByTestId('change-muscleKg')).toHaveAttribute('data-verdict', 'better');
    expect(screen.getByTestId('change-fatKg')).toHaveAttribute('data-verdict', 'better');
  });

  it('any two scans can be picked; the same scan twice asks for two', async () => {
    await renderAs('104');
    const from = await screen.findByTestId('compare-from');
    const to = screen.getByTestId('compare-to');
    await userEvent.selectOptions(from, (to as HTMLSelectElement).value);
    expect(await screen.findByText('Pick two different scans.')).toBeInTheDocument();
    expect(screen.queryByTestId('compare-result')).toBeNull();
  });

  it('with one scan, says when Compare appears', async () => {
    await renderAs('103');
    expect(await screen.findByTestId('compare-need-two')).toHaveTextContent('Compare shows after your second scan');
  });
});
