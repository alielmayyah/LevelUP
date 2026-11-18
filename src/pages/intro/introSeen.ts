import { Preferences } from '@capacitor/preferences';

/** Set once the member finishes or skips the intro slides, so they show only on first launch. */
export const INTRO_KEY = 'lu.intro';

export const introSeen = async (): Promise<boolean> => (await Preferences.get({ key: INTRO_KEY })).value === 'seen';

export const markIntroSeen = (): Promise<void> => Preferences.set({ key: INTRO_KEY, value: 'seen' });
