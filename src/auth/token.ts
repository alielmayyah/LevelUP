import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'lu.token';

type Listener = (signedIn: boolean) => void;
const listeners = new Set<Listener>();

/** Called with the new state whenever the member signs in or out. Returns an unsubscribe. */
export function onAuthChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function getToken(): Promise<string | null> {
  return (await Preferences.get({ key: TOKEN_KEY })).value;
}

export async function setToken(token: string): Promise<void> {
  await Preferences.set({ key: TOKEN_KEY, value: token });
  listeners.forEach((fn) => fn(true));
}

export async function clearToken(): Promise<void> {
  await Preferences.remove({ key: TOKEN_KEY });
  listeners.forEach((fn) => fn(false));
}
