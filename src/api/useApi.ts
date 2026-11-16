import { useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from './client';

export type ApiState<T> =
  { status: 'loading'; data: null } | { status: 'error'; data: null } | { status: 'ready'; data: T };

/**
 * GETs `path` on mount. `reload()` fetches again and keeps the current data on
 * screen while it runs (pull to refresh); it resolves when the request ends.
 * `setData` lets a screen update the cached value after a write. Pass null to skip a request.
 */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading', data: null });
  const live = useRef(true);

  const reload = useCallback(async () => {
    if (path === null) return;
    try {
      const data = await api<T>(path);
      if (live.current) setState({ status: 'ready', data });
    } catch {
      // A failed refresh keeps the data already on screen.
      if (live.current) setState((s) => (s.status === 'ready' ? s : { status: 'error', data: null }));
    }
  }, [path]);

  const retry = useCallback(() => {
    setState({ status: 'loading', data: null });
    return reload();
  }, [reload]);

  const setData = useCallback((update: (data: T) => T) => {
    setState((s) => (s.status === 'ready' ? { status: 'ready', data: update(s.data) } : s));
  }, []);

  useEffect(() => {
    live.current = true;
    if (path === null) return;
    api<T>(path).then(
      (data) => live.current && setState({ status: 'ready', data }),
      () => live.current && setState({ status: 'error', data: null }),
    );
    return () => {
      live.current = false;
    };
  }, [path]);

  return { ...state, reload, retry, setData };
}

/**
 * Keeps a tab's data fresh without a reload:
 * - each time an already-open tab comes back into view (Ionic keeps tab pages
 *   mounted), so a change made on another tab, like a setting in Profile, shows
 *   up. The first entry is skipped because the initial fetch already ran.
 * - when the app returns to the foreground or the network comes back, but only
 *   for the tab that is visible, so hidden tabs don't all refetch at once.
 */
export function useRefreshOnEnter(reload: () => Promise<unknown>): void {
  const entered = useRef(false);
  // A mounted page is visible until Ionic says it is leaving.
  const visible = useRef(true);

  useIonViewWillEnter(() => {
    visible.current = true;
    if (entered.current) void reload();
    entered.current = true;
  }, [reload]);
  useIonViewWillLeave(() => {
    visible.current = false;
  }, []);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (visible.current && document.visibilityState === 'visible') void reload();
    };
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener('online', refreshIfVisible);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener('online', refreshIfVisible);
    };
  }, [reload]);
}
