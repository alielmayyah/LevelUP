import type { IconName } from './Icon';

export const TABS = [
  { tab: 'home', href: '/tabs/home', icon: 'house' },
  { tab: 'progress', href: '/tabs/progress', icon: 'chart' },
  { tab: 'goals', href: '/tabs/goals', icon: 'target' },
  { tab: 'community', href: '/tabs/community', icon: 'community' },
  { tab: 'profile', href: '/tabs/profile', icon: 'person' },
] as const satisfies readonly { tab: string; href: string; icon: IconName }[];

/** Index of the tab that owns `pathname`, or -1. */
export const tabIndex = (pathname: string): number => {
  const path = pathname === '/tabs/leaderboard' ? '/tabs/community/leaderboard' : pathname;
  return TABS.findIndex((t) => path === t.href || path.startsWith(`${t.href}/`));
};

/** The pill moves one tab width per index, toward the inline end. */
export const pillTransform = (index: number, rtl: boolean): string =>
  `translateX(${rtl && index > 0 ? '-' : ''}${index * 100}%)`;
