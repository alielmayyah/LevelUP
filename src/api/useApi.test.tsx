import { Preferences } from '@capacitor/preferences';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setToken } from '../auth/token';
import { mockServer, resetMockServer } from './mock/server';
import type { DashboardDto } from './types';
import { useApi, useRefreshOnEnter } from './useApi';

const Probe: React.FC = () => {
  const d = useApi<DashboardDto>('/me/dashboard');
  useRefreshOnEnter(d.reload);
  return <p>{d.status}</p>;
};

const setVisibility = (state: 'visible' | 'hidden') =>
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });

describe('useRefreshOnEnter', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(new Date('2026-11-13T10:00:00Z'));
    await setToken('mock.101');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setVisibility('visible');
  });

  const dashboardCalls = (spy: ReturnType<typeof vi.spyOn>) =>
    spy.mock.calls.filter((c: unknown[]) => c[1] === '/me/dashboard').length;

  it('refetches when the app comes back to the foreground', async () => {
    const spy = vi.spyOn(mockServer, 'handle');
    render(<Probe />);
    await screen.findByText('ready');
    expect(dashboardCalls(spy)).toBe(1);

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(dashboardCalls(spy)).toBe(1); // nothing while in the background

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(dashboardCalls(spy)).toBe(2));
  });

  it('refetches when the network comes back', async () => {
    const spy = vi.spyOn(mockServer, 'handle');
    render(<Probe />);
    await screen.findByText('ready');
    window.dispatchEvent(new Event('online'));
    await waitFor(() => expect(dashboardCalls(spy)).toBe(2));
  });

  it('stops listening once the page is gone', async () => {
    const spy = vi.spyOn(mockServer, 'handle');
    const { unmount } = render(<Probe />);
    await screen.findByText('ready');
    unmount();
    window.dispatchEvent(new Event('online'));
    expect(dashboardCalls(spy)).toBe(1);
  });
});
