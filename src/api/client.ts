import { getToken } from '../auth/token';

/** A non-2xx API response. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown = null,
  ) {
    super(`API error ${status}`);
    this.name = 'ApiError';
  }
}

type Handler = () => void;
const unauthorizedHandlers = new Set<Handler>();

/** Registers a handler for 401s on data routes (sign out, go to login). Returns an unsubscribe. */
export function onUnauthorized(fn: Handler): () => void {
  unauthorizedHandlers.add(fn);
  return () => unauthorizedHandlers.delete(fn);
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const MOCK_LATENCY_MS = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 300) || 0;
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const isAuthRoute = (path: string) => path.startsWith('/auth/');

const parseBody = (body: RequestInit['body']): unknown => {
  if (typeof body !== 'string' || body === '') return null;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

const delay = (ms: number) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

async function send(path: string, init: RequestInit, token: string | null): Promise<{ status: number; body: unknown }> {
  if (USE_MOCKS) {
    // Loaded on demand so the fixtures stay out of the initial bundle and out of
    // real-API builds entirely.
    const { mockServer } = await import('./mock/server');
    const res = await mockServer.handle(init.method ?? 'GET', path, parseBody(init.body), token);
    await delay(MOCK_LATENCY_MS);
    return res;
  }

  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const text = res.status === 204 ? '' : await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

/**
 * Calls the LevelUP API. With VITE_USE_MOCKS=true the call goes to the
 * in-memory mock server and never touches the network.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const { status, body } = await send(path, init, token);
  if (status === 401 && !isAuthRoute(path)) unauthorizedHandlers.forEach((fn) => fn());
  if (status < 200 || status >= 300) throw new ApiError(status, body);
  return (status === 204 ? undefined : body) as T;
}
