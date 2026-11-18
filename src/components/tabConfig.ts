import type { IconName } from './Icon';

/** The four tabs (docs/redesign/PLAN.md, decision 1). Goals live under Account. */
export const TABS = [
  { tab: 'home', href: '/tabs/home', icon: 'house' },
  { tab: 'scans', href: '/tabs/scans', icon: 'scan' },
  { tab: 'compare', href: '/tabs/compare', icon: 'compare' },
  { tab: 'account', href: '/tabs/account', icon: 'person' },
] as const satisfies readonly { tab: string; href: string; icon: IconName }[];

/** Index of the tab that owns `pathname`, or -1. */
export const tabIndex = (pathname: string): number =>
  TABS.findIndex((t) => pathname === t.href || pathname.startsWith(`${t.href}/`));

/** The pill moves one tab width per index, toward the inline end. */
export const pillTransform = (index: number, rtl: boolean): string =>
  `translateX(${rtl && index > 0 ? '-' : ''}${index * 100}%)`;
