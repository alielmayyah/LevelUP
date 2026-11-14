/*
 * Tab gestures for a native feel on phones:
 *
 *   - Swipe left or right on a tab page to move to the next or previous tab,
 *     in reading order (mirrored in Arabic). The tab bar stays the visible
 *     alternative.
 *   - Android back on a tab other than Home goes to Home; on Home it leaves
 *     the app, as native Android apps with a bottom bar do.
 *
 * Conflicts (see the ionic-mobile-experience gesture notes): a swipe that
 * starts near a screen edge belongs to the system back gesture, one that
 * starts on a control or horizontal content belongs to that control, and
 * nothing runs while a sheet or dialog is open. Listeners are passive, so
 * vertical scrolling and pull-to-refresh are untouched.
 */
import { App } from '@capacitor/app';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { TABS, tabIndex } from './tabConfig';

/** Distance from either screen edge that belongs to the system back gesture. */
export const EDGE_PX = 24;
/** A swipe must travel at least this far sideways… */
export const MIN_DISTANCE_PX = 60;
/** …be clearly more sideways than up or down… */
const DIRECTION_RATIO = 1.5;
/** …and be quick: a slow drag is someone reading or scrolling. */
const MAX_DURATION_MS = 600;

export interface Swipe {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  ms: number;
  width: number;
}

/**
 * The tab a swipe lands on, or null when it isn't a tab swipe. Swiping toward
 * the inline start (left in English, right in Arabic) moves to the next tab.
 */
export function swipeTarget(s: Swipe, index: number, count: number, rtl: boolean): number | null {
  if (index < 0) return null;
  if (s.startX < EDGE_PX || s.startX > s.width - EDGE_PX) return null;
  const dx = s.endX - s.startX;
  const dy = s.endY - s.startY;
  if (Math.abs(dx) < MIN_DISTANCE_PX || Math.abs(dx) < Math.abs(dy) * DIRECTION_RATIO) return null;
  if (s.ms > MAX_DURATION_MS) return null;
  const forward = rtl ? dx > 0 : dx < 0;
  const next = index + (forward ? 1 : -1);
  return next >= 0 && next < count ? next : null;
}

/** Touches that start here belong to the element, not to tab swiping. */
const OWNS_HORIZONTAL =
  'input, textarea, select, [role="slider"], [role="radiogroup"], [role="tablist"], [data-no-tab-swipe], .lu-segment, ion-tab-bar, ion-refresher';

function startsOnOwnGesture(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest(OWNS_HORIZONTAL)) return true;
  // Content that scrolls sideways keeps its own swipe.
  for (let el: Element | null = target; el && el !== document.body; el = el.parentElement) {
    if (el.scrollWidth > el.clientWidth + 1) {
      const overflow = getComputedStyle(el).overflowX;
      if (overflow === 'auto' || overflow === 'scroll') return true;
    }
  }
  return false;
}

/** True while a sheet, dialog, or other overlay is on screen. */
const overlayOpen = () =>
  !!document.querySelector('dialog[open], ion-modal.show-modal, ion-modal[is-open="true"], .lu-dialog[open]');

/** Opens a tab the same way a tap on its button does (pill, sound, and Ionic's tab history). */
function openTab(index: number): void {
  document.querySelector<HTMLElement>(`ion-tab-button[tab="${TABS[index].tab}"]`)?.click();
}

/** Swipe between tab pages. Only on the tab root pages, not on pages stacked above them. */
export function useTabSwipe(): void {
  const { pathname } = useLocation();
  const index = TABS.findIndex((t) => t.href === pathname);

  useEffect(() => {
    if (index < 0) return;
    let start: { x: number; y: number; t: number } | null = null;

    const onStart = (e: TouchEvent) => {
      start = null;
      if (e.touches.length !== 1 || overlayOpen() || startsOnOwnGesture(e.target)) return;
      const touch = e.touches[0];
      start = { x: touch.clientX, y: touch.clientY, t: e.timeStamp };
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const touch = e.changedTouches[0];
      const target = swipeTarget(
        {
          startX: start.x,
          startY: start.y,
          endX: touch.clientX,
          endY: touch.clientY,
          ms: e.timeStamp - start.t,
          width: window.innerWidth,
        },
        index,
        TABS.length,
        document.documentElement.dir === 'rtl',
      );
      start = null;
      if (target !== null) openTab(target);
    };
    const onCancel = () => (start = null);

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onCancel);
    };
  }, [index]);
}

/**
 * Android back: a stacked page (the character editor) goes back as usual;
 * another tab goes to Home; Home leaves the app. Overlays register higher
 * (100–150) and close first.
 */
export function useTabBack(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const onBack = (e: Event) =>
      (
        e as CustomEvent<{ register: (priority: number, handler: (processNext: () => void) => void) => void }>
      ).detail.register(10, (processNext) => {
        const index = tabIndex(pathname);
        const atRoot = TABS.some((t) => t.href === pathname);
        if (index < 0 || !atRoot) return processNext();
        if (index > 0) return openTab(0);
        void App.exitApp().catch(() => undefined);
      });
    document.addEventListener('ionBackButton', onBack);
    return () => document.removeEventListener('ionBackButton', onBack);
  }, [pathname]);
}
