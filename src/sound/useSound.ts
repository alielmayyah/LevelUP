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
let audioCtx: AudioContext | null = null;

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
  audioCtx = null;
  listeners.forEach((fn) => fn());
}

export function useSound(): { enabled: boolean; toggle(): void; play(name: SoundName): void } {
  const on = useSyncExternalStore(subscribe, getEnabled);
  return { enabled: on, toggle, play };
}

/**
 * The splash chime: a soft rising arpeggio (C, E, G, high C) with a little
 * shimmer, synthesized with Web Audio so there is no file to download.
 * Respects the sound setting. Browsers may block audio before the first tap
 * (the web, some web views); then it stays silent, which is fine for a splash.
 */
export function playIntro(): void {
  if (!enabled || typeof window === 'undefined') return;
  const Ctx =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  try {
    audioCtx ??= new Ctx();
    const ctx = audioCtx;
    void ctx.resume?.().catch(() => undefined);
    const start = ctx.currentTime + 0.05;
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = start + i * 0.09;
      const last = i === 3;
      for (const [type, detune, level] of [
        ['triangle', 0, 1],
        ['sine', 1200, 0.25],
      ] as const) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(level, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (last ? 1.1 : 0.35));
        osc.connect(gain).connect(master);
        osc.start(t);
        osc.stop(t + (last ? 1.2 : 0.4));
      }
    });
  } catch {
    // No audio available: the splash is silent.
  }
}
