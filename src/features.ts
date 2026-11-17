/**
 * Parts of the app that are built but switched off for now. Community (the
 * gym room, leaderboards, member cards, the Home rank card and the
 * leaderboard setting) comes later; set VITE_COMMUNITY=true to show it.
 */
export const features = {
  community: import.meta.env.VITE_COMMUNITY === 'true',
} as const;
