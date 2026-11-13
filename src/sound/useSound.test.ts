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
