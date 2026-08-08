/**
 * Single source of truth for gym branding: app name, logo, and colors.
 * White-labeling a gym means changing values here — nothing else in the
 * app should hardcode a gym name, logo path, or brand color.
 */
export interface ThemeConfig {
  app: {
    /** Full product name, e.g. shown in the splash screen wordmark area. */
    name: string;
    /** Short name for tight spaces (browser tab, PWA home screen icon). */
    shortName: string;
    /** Uppercase strapline, e.g. "TRACK • IMPROVE • TRANSFORM". */
    tagline: string;
    /** Shown under the splash screen's "Tap to Begin" call to action. */
    welcomeMessage: string;
  };
  logo: {
    /** Path under /public, or a full URL. */
    src: string;
    alt: string;
  };
  colors: {
    background: string;
    foreground: string;
    /** The one purple that should feel valuable — use sparingly, not on every element. */
    primary: string;
    /** Lighter purple, paired with primary for the rare two-stop gradient moment. */
    accent: string;
    /** Positive outcomes: fat loss, muscle gain, streaks, completed goals. */
    success: string;
    warning: string;
    danger: string;
  };
}

export const theme: ThemeConfig = {
  app: {
    name: "LevelUP",
    shortName: "LevelUP",
    tagline: "TRACK • IMPROVE • TRANSFORM",
    welcomeMessage: "Your transformation starts here",
  },
  logo: {
    src: "/logo.png",
    alt: "LevelUP",
  },
  colors: {
    background: "#08090D",
    foreground: "#F2F2F5",
    primary: "#7C5CFF",
    accent: "#9275FF",
    success: "#18D37D",
    warning: "#FFB020",
    danger: "#FF5D73",
  },
};
