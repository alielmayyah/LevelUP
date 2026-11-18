import { Preferences } from '@capacitor/preferences';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import ScanReport from './ScanReport';

const NOW = new Date('2026-11-18T12:00:00Z');

const renderScan = async (fitId: string, id: number) => {
  await setToken(`mock.${fitId}`);
  render(
    <MemoryRouter initialEntries={[`/tabs/scans/${id}`]}>
      <Route path="/tabs/scans/:id" component={ScanReport} />
    </MemoryRouter>,
  );
};

/** Strips the bidi isolates and no-break spaces that keep numbers and units together. */
const plain = (el: Element) => (el.textContent ?? '').replace(/[\u2066-\u2069]/g, '').replace(/\u00a0/g, ' ');

describe('ScanReport', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(NOW);
  });
  afterEach(async () => {
    await setLanguage('en');
  });

  it('opens with the stamp of the scan and its change against the scan before', async () => {
    await renderScan('104', 10);
    const stamp = await screen.findByTestId('scan-stamp');
    expect(stamp).toHaveTextContent('Stop 3');
    expect(stamp).toHaveTextContent('Iron Box · New Cairo');
    expect(stamp).toHaveTextContent('InBody 770');
    const vs = within(stamp).getByTestId('scan-vs-previous');
    expect(await within(vs).findByTestId('change-muscleKg')).toHaveAttribute('data-verdict', 'same');
  });

  it('puts each value on the band the machine printed, with one word', async () => {
    await renderScan('104', 10);
    const values = await screen.findByTestId('scan-values');
    expect(values).toHaveTextContent('Normal ranges from the machine');
    const fat = within(values).getByTestId('range-bodyFatKg');
    expect(fat).toHaveAttribute('data-zone', 'normal');
    expect(plain(fat)).toContain('Normal: 8.4–16.8');
    expect(within(values).getByTestId('range-visceralFatLevel')).toHaveTextContent('Goal: under 10');
  });

  it('shows body balance as lean mass by part, balanced within 2%', async () => {
    await renderScan('104', 10);
    const balance = await screen.findByTestId('body-balance');
    expect(within(balance).getByTestId('beam-arms')).toHaveAttribute('data-balanced', 'true');
    expect(within(balance).getByTestId('beam-legs')).toHaveAttribute('data-balanced', 'true');
    expect(plain(within(balance).getByTestId('part-rightArm'))).toContain('3.48 kg');
  });

  it('keeps the rest behind More numbers', async () => {
    await renderScan('104', 10);
    const more = await screen.findByTestId('scan-more');
    expect(within(more).queryByTestId('more-bmrKcal')).toBeNull();
    await userEvent.click(within(more).getByTestId('scan-more-toggle'));
    expect(plain(within(more).getByTestId('more-bmrKcal'))).toContain('1,730');
    expect(plain(within(more).getByTestId('more-deviceScore'))).toContain('79');
  });

  it('a first scan has nothing to compare and uses the standard bands', async () => {
    await renderScan('103', 7);
    expect(await screen.findByTestId('scan-first')).toBeInTheDocument();
    expect(screen.getByTestId('scan-values')).toHaveTextContent('Normal ranges worked out for your height.');
    expect(screen.getByTestId('scan-disclaimer')).toHaveTextContent('Fitness information, not a medical diagnosis.');
  });

  it('a scan id that belongs to someone else is not found', async () => {
    await renderScan('104', 1);
    expect(await screen.findByTestId('scan-missing')).toBeInTheDocument();
  });
});
