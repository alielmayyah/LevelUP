import { IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import Icon from './Icon';
import { pillTransform, tabIndex, TABS } from './tabConfig';
import './TabBar.scss';

/*
 * The navigation bar: full width along the bottom of the screen, above the home
 * indicator. Page bodies reserve room for it (theme/layout.css).
 */
const BAR = [
  // Full width, flush with the bottom edge; the home indicator sits inside its bottom padding.
  'lu-tabbar absolute inset-x-0 bottom-0 z-10 box-border w-full',
  'h-[calc(var(--lu-tabbar-height)+var(--ion-safe-area-bottom,0px))]',
  'lu-navbar pt-(--lu-tabbar-padding) pb-[calc(var(--lu-tabbar-padding)+var(--ion-safe-area-bottom,0px))] [--lu-tabbar-padding:4px]',
  'ps-[calc(var(--lu-tabbar-padding)+var(--ion-safe-area-left,0px))] pe-[calc(var(--lu-tabbar-padding)+var(--ion-safe-area-right,0px))]',
  'short-landscape:h-[calc(48px+var(--ion-safe-area-bottom,0px))] short-landscape:[--lu-tabbar-padding:4px]',
].join(' ');

/*
 * One tab-wide slot that slides with a CSS transform (compositor only, no JS
 * per frame); the compact indicator sits centered in it, behind the icon.
 * Reduced motion: it jumps.
 */
const PILL =
  'absolute inset-y-0 start-0 transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none motion-reduce:duration-0';
const INDICATOR = 'lu-navbar-indicator absolute top-1 left-1/2 h-8 w-[min(56px,88%)] -translate-x-1/2';

const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** Longest the label waits for the pill, in case transitionend never fires (tab hidden, transition cut). */
const LIT_FALLBACK_MS = 400;

/**
 * Full-width 5-tab navigation bar inside a <nav> landmark. IonTabBar only renders
 * IonTabButton children, so the sliding pill sits beside it.
 *
 * Each tab is named by its visible label (WCAG 2.5.3, label in name). Ionic
 * puts role="tab" on the button's inner link; an aria-label on the button
 * itself would be copied onto the outer element too, which breaks the tab
 * list's structure for screen readers.
 *
 * A label turns white only once the pill has arrived under it, so text never
 * sits white-on-white mid-move.
 */
/** Full-screen pages: the tab bar steps aside; they carry their own Back button. */
const FULL_SCREEN = new Set(['/tabs/profile/character']);

const TabBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const fullScreen = FULL_SCREEN.has(pathname);
  const index = tabIndex(pathname);
  const rtl = i18n.dir() === 'rtl';

  const pill = useRef<HTMLDivElement>(null);
  const shown = useRef({ index: Math.max(index, 0), rtl });
  /** The tab whose label is drawn on the pill (white). Lags the route until the pill arrives. */
  const [lit, setLit] = useState(index);

  useLayoutEffect(() => {
    const el = pill.current;
    if (!el) return;
    const to = Math.max(index, 0);
    const from = shown.current;
    shown.current = { index: to, rtl };
    const slide = index >= 0 && from.index !== to && from.rtl === rtl && window.matchMedia(MOTION_OK).matches;

    if (!slide) {
      // Jump with no transition: first render, language flip, or reduced motion.
      el.style.transition = 'none';
      el.style.transform = pillTransform(to, rtl);
      void el.offsetWidth;
      el.style.transition = '';
      setLit(index);
      return;
    }

    el.style.transform = pillTransform(to, rtl);
    const arrive = () => setLit(index);
    const onEnd = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === 'transform') arrive();
    };
    el.addEventListener('transitionend', onEnd);
    const timer = window.setTimeout(arrive, LIT_FALLBACK_MS);
    return () => {
      el.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
    };
  }, [index, rtl]);

  return (
    <nav className={fullScreen ? `${BAR} hidden` : BAR} slot="bottom" aria-label={t('tabs.navLabel')}>
      {/* The panel spans the screen; the five tabs stay in a centered row so wide screens don't get giant tabs. */}
      <div className="relative mx-auto h-full max-w-[560px]">
        <div
          className={PILL}
          style={{ inlineSize: `${100 / TABS.length}%` }}
          data-testid="tab-pill"
          ref={pill}
          aria-hidden="true"
          hidden={index < 0}
        >
          <span className={INDICATOR} />
        </div>
        <IonTabBar>
          {TABS.map(({ tab, href, icon }, i) => (
            <IonTabButton
              key={tab}
              tab={tab}
              href={href}
              data-testid={`tab-${tab}`}
              className={i === lit ? 'is-lit' : undefined}
              // Tapping the tab you're already on scrolls it back to the top (iOS and Android convention).
              onClick={() => {
                if (pathname !== href) return;
                const content = document.querySelector<HTMLIonContentElement>(
                  `[data-testid="page-${tab}"] ion-content`,
                );
                void content?.scrollToTop(window.matchMedia(MOTION_OK).matches ? 300 : 0);
              }}
            >
              <Icon name={icon} />
              {/* Short labels fit a 320–390 px bar. Below 360 px they are visually hidden but still read out. */}
              <IonLabel>{t(`tabs.short.${tab}`)}</IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
      </div>
    </nav>
  );
};

export default TabBar;
