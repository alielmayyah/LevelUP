import { flag, home, person, podium, trendingUp } from 'ionicons/icons';

export const TABS = [
  { tab: 'home', href: '/tabs/home', icon: home },
  { tab: 'progress', href: '/tabs/progress', icon: trendingUp },
  { tab: 'goals', href: '/tabs/goals', icon: flag },
  { tab: 'leaderboard', href: '/tabs/leaderboard', icon: podium },
  { tab: 'profile', href: '/tabs/profile', icon: person },
] as const;

/** Index of the tab that owns `pathname`, or -1. */
export const tabIndex = (pathname: string): number =>
  TABS.findIndex((t) => pathname === t.href || pathname.startsWith(`${t.href}/`));

/** The pill moves one tab width per index, toward the inline end. */
export const pillTransform = (index: number, rtl: boolean): string =>
  `translateX(${rtl && index > 0 ? '-' : ''}${index * 100}%)`;
