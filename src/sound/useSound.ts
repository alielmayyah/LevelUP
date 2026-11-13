import { Preferences } from '@capacitor/preferences';
import { useSyncExternalStore } from 'react';

export type SoundName = 'tap' | 'success';

const STORAGE_KEY = 'lu.sound';

/*
 * One shared on/off flag, so the splash button, the login button, and the
 * Settings switch always agree. Sound is on unless the member turned it off.
 */
let enabled = true;
const listeners = new Set<() => void>();
const clips = new Map<SoundName, HTMLAudioElement>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getEnabled = () => enabled;

function setEnabled(next: boolean): void {
  enabled = next;
  listeners.forEach((fn) => fn());
  void Preferences.set({ key: STORAGE_KEY, value: next ? 'on' : 'off' });
}

function play(name: SoundName): void {
  if (!enabled) return;
  let clip = clips.get(name);
  if (!clip) {
    clip = new Audio(`/sounds/${name}.mp3`);
    clip.preload = 'auto';
    clips.set(name, clip);
  }
  clip.currentTime = 0;
  // Browsers may block playback before the first gesture; a missed sound is fine.
  void clip.play()?.catch(() => undefined);
}

const toggle = () => setEnabled(!enabled);

/** Restores the saved choice. Call once before the first render. */
export async function initSound(): Promise<void> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  enabled = value !== 'off';
  listeners.forEach((fn) => fn());
}

/** Test helper: back to the default (on) without touching storage. */
export function resetSound(): void {
  enabled = true;
  clips.clear();
  listeners.forEach((fn) => fn());
}

export function useSound(): { enabled: boolean; toggle(): void; play(name: SoundName): void } {
  const on = useSyncExternalStore(subscribe, getEnabled);
  return { enabled: on, toggle, play };
}
