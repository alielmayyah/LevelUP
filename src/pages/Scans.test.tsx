import { Preferences } from '@capacitor/preferences';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetMockServer } from '../api/mock/server';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import Scans from './Scans';

const NOW = new Date('2026-11-18T12:00:00Z');

const renderAs = async (fitId: string) => {
  await setToken(`mock.${fitId}`);
  render(
    <MemoryRouter>
      <Scans />
    </MemoryRouter>,
  );
};

describe('Scans', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(NOW);
  });
  afterEach(async () => {
    await setLanguage('en');
  });

  it('draws muscle and fat lanes with the noise band and a flag where each leaves it', async () => {
    await renderAs('104');
    const trends = await screen.findByTestId('scans-trends');
    for (const lane of ['muscle', 'fat']) {
      expect(within(trends).getByTestId(`lane-${lane}`)).toBeInTheDocument();
      expect(within(trends).getByTestId(`lane-${lane}-band`)).toBeInTheDocument();
      expect(within(trends).getByTestId(`lane-${lane}-flag`)).toBeInTheDocument();
    }
  });

  it('lists every scan newest first, with the next one on top, each opening its report', async () => {
    await renderAs('104');
    const timeline = await screen.findByTestId('scans-timeline');
    expect(within(timeline).getByTestId('timeline-next')).toHaveTextContent('Next scan');
    const rows = within(timeline).getAllByTestId('timeline-scan');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveAttribute('href', '/tabs/scans/10');
    expect(rows[0]).toHaveTextContent('Iron Box · InBody 770');
  });

  it('one scan: no lines yet, and says when they appear', async () => {
    await renderAs('103');
    expect(await screen.findByTestId('scans-one')).toHaveTextContent('The lines appear after your second scan.');
  });

  it('no scans: what to do first', async () => {
    await renderAs('102');
    expect(await screen.findByTestId('scans-empty')).toHaveTextContent('No scans yet');
  });
});
