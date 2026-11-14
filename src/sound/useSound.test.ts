import { Preferences } from '@capacitor/preferences';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initSound, resetSound, useSound } from './useSound';

describe('useSound', () => {
  let audioPlay: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await Preferences.clear();
    resetSound();
    audioPlay = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  });

  afterEach(() => {
    audioPlay.mockRestore();
  });

  it('is on by default and plays the named sound', () => {
    const { result } = renderHook(useSound);
    expect(result.current.enabled).toBe(true);
    result.current.play('tap');
    expect(audioPlay).toHaveBeenCalledTimes(1);
  });

  it('sound off means play is a no-op', () => {
    const { result } = renderHook(useSound);
    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(false);
    result.current.play('tap');
    result.current.play('success');
    expect(audioPlay).not.toHaveBeenCalled();
  });

  it('every user of the hook sees a toggle straight away', () => {
    const a = renderHook(useSound);
    const b = renderHook(useSound);
    act(() => a.result.current.toggle());
    expect(b.result.current.enabled).toBe(false);
  });

  it('saves the choice and restores it on the next launch', async () => {
    const { result } = renderHook(useSound);
    act(() => result.current.toggle());
    await vi.waitFor(async () => expect((await Preferences.get({ key: 'lu.sound' })).value).toBe('off'));

    resetSound();
    await initSound();
    const { result: next } = renderHook(useSound);
    expect(next.current.enabled).toBe(false);
  });

  it('a blocked autoplay never throws', () => {
    audioPlay.mockRejectedValue(new Error('NotAllowedError'));
    const { result } = renderHook(useSound);
    expect(() => result.current.play('tap')).not.toThrow();
  });
});

describe('playIntro', () => {
  const makeCtx = () => {
    const node = () => ({
      connect: vi.fn((n) => n),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    });
    const oscillators: unknown[] = [];
    class FakeCtx {
      currentTime = 0;
      destination = {};
      resume = vi.fn(() => Promise.resolve());
      createGain = vi.fn(node);
      createOscillator = vi.fn(() => {
        const osc = {
          ...node(),
          type: '',
          frequency: { value: 0 },
          detune: { value: 0 },
          start: vi.fn(),
          stop: vi.fn(),
        };
        oscillators.push(osc);
        return osc;
      });
    }
    return { FakeCtx, oscillators };
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    resetSound();
  });

  it('plays the four-note chime when sound is on', async () => {
    const { FakeCtx, oscillators } = makeCtx();
    vi.stubGlobal('AudioContext', FakeCtx);
    const { playIntro } = await import('./useSound');
    playIntro();
    // Four notes, each a main tone plus a shimmer an octave up.
    expect(oscillators).toHaveLength(8);
  });

  it('stays silent when the member turned sound off', async () => {
    const { FakeCtx, oscillators } = makeCtx();
    vi.stubGlobal('AudioContext', FakeCtx);
    const mod = await import('./useSound');
    const { result } = renderHook(() => mod.useSound());
    act(() => result.current.toggle());
    mod.playIntro();
    expect(oscillators).toHaveLength(0);
  });
});
