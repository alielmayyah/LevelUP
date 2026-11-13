import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'lu.token';

export async function getToken(): Promise<string | null> {
  return (await Preferences.get({ key: TOKEN_KEY })).value;
}

export async function setToken(token: string): Promise<void> {
  await Preferences.set({ key: TOKEN_KEY, value: token });
}

export async function clearToken(): Promise<void> {
  await Preferences.remove({ key: TOKEN_KEY });
}
