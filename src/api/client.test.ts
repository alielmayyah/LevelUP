import { Preferences } from '@capacitor/preferences';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearToken, setToken } from '../auth/token';
import { api, ApiError, onUnauthorized } from './client';
import { resetMockServer } from './mock/server';
import type { DashboardDto, LoginResponse } from './types';

describe('api client (mock mode)', () => {
  beforeEach(async () => {
    await Preferences.clear();
    resetMockServer(new Date('2026-11-13T10:00:00Z'));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('makes no network requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await setToken('mock.101');
    await api<DashboardDto>('/me/dashboard');
    await api<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ fitId: '102' }) });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends the stored token', async () => {
    await setToken('mock.101');
    const d = await api<DashboardDto>('/me/dashboard');
    expect(d.member.firstName).toBe('Mohamed');
  });

  it('signs in with a JSON body', async () => {
    const r = await api<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ fitId: '103' }) });
    expect(r.accessToken).toBe('mock.103');
  });

  it('throws ApiError with the status on a non-2xx response', async () => {
    await setToken('mock.101');
    await expect(api('/leaderboard?board=xp')).rejects.toMatchObject({ status: 400 });
    await expect(api('/leaderboard?board=xp')).rejects.toBeInstanceOf(ApiError);
  });

  it('a data request without a token is refused and calls the unauthorized handler', async () => {
    await clearToken();
    const handler = vi.fn();
    const off = onUnauthorized(handler);
    await expect(api('/me/dashboard')).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
    off();
  });

  it('a wrong Fit ID at login does not call the unauthorized handler', async () => {
    const handler = vi.fn();
    const off = onUnauthorized(handler);
    await expect(api('/auth/login', { method: 'POST', body: JSON.stringify({ fitId: '999' }) })).rejects.toMatchObject({
      status: 401,
    });
    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it('returns undefined for an empty 204 response', async () => {
    await setToken('mock.101');
    const list = await api<{ id: number }[]>('/me/notifications');
    await expect(api(`/me/notifications/${list[0].id}/read`, { method: 'PATCH' })).resolves.toBeUndefined();
  });
});
