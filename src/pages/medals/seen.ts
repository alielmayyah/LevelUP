import { Preferences } from '@capacitor/preferences';

/** Medal ids whose unlock celebration a member has already seen, per member, on this device. */
const key = (memberId: number) => `lu.medals.seen.${memberId}`;

export async function loadSeen(memberId: number): Promise<Set<string>> {
  try {
    const { value } = await Preferences.get({ key: key(memberId) });
    const list: unknown = value ? JSON.parse(value) : [];
    return new Set(Array.isArray(list) ? list.filter((id): id is string => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Adds ids to the seen set. Adding an id twice is a no-op. */
export async function markSeen(memberId: number, ids: string[]): Promise<Set<string>> {
  const seen = await loadSeen(memberId);
  ids.forEach((id) => seen.add(id));
  await Preferences.set({ key: key(memberId), value: JSON.stringify([...seen]) });
  return seen;
}
