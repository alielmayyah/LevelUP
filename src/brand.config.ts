/*
 * Branding.
 *
 * LevelUP is the product: its name, logo, and colors are the same in every
 * gym's deployment. A gym brings only its own logo, shown alongside LevelUP's.
 * To set up a gym, add its logo under public/gym/ and point `gym.logo` at it.
 * No other file contains brand values.
 *
 * Only brand hues live here. Backgrounds, surfaces, and text come from the
 * light and dark theme tokens (src/theme/tokens.css), because one brand
 * background can't serve both themes. Text on each brand color is picked
 * automatically (black or white, whichever reads better).
 */

export interface AppBrand {
  /** The app title. */
  name: string;
  /** The end of the name drawn in the brand gradient, as in the logo ("UP"). */
  nameAccent: string;
  /** Full lockup (mark + wordmark + tagline), path under public/. */
  logo: string;
  /** The mark alone, for the splash. Path under public/, ≤ 100 KB. */
  mark: string;
  colors: {
    /** Buttons, the active tab pill, progress rings, chart lines. */
    primary: string;
    secondary: string;
    /** Badges: FitScore tier, "Renews soon". */
    accent: string;
  };
}

export interface GymConfig {
  /** The gym's logo, path under public/. null hides the gym logo slot. */
  logo: string | null;
}

/** Where public files are served from: / in dev and the app, /LevelUP/ on GitHub Pages. Node (e2e) has no import.meta.env. */
const BASE: string = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';

export const brand: AppBrand = {
  name: 'LevelUP',
  nameAccent: 'UP',
  logo: `${BASE}brand/logo.webp`,
  mark: `${BASE}brand/mark.webp`,
  colors: {
    primary: '#6c3cf0',
    secondary: '#b77cf7',
    accent: '#f5a524',
  },
};

export const gym: GymConfig = {
  logo: null,
};
