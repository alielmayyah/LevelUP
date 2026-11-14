import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { pillTransform, tabIndex, TABS } from './tabConfig';
import './TabBar.scss';

/*
 * Floating bar in the pixel style: chunky border, hard drop shadow, and a blocky
 * pill. Centered, at most 480 px wide, above the home indicator. Page bodies
 * reserve room for it (theme/layout.css). Slimmer on a phone held sideways.
 */
const BAR = [
  'lu-tabbar absolute inset-x-0 bottom-[calc(var(--lu-tabbar-gap)+var(--ion-safe-area-bottom,0px))] z-10 mx-auto box-border',
  'h-(--lu-tabbar-height) w-[calc(100%-var(--lu-gutter)*2-var(--ion-safe-area-left,0px)-var(--ion-safe-area-right,0px))] max-w-[480px]',
  'rounded-2xl border-2 border-line bg-surface p-(--lu-tabbar-padding) shadow-px [--lu-tabbar-padding:6px]',
  'short-landscape:bottom-[calc(8px+var(--ion-safe-area-bottom,0px))] short-landscape:h-12 short-landscape:max-w-[360px] short-landscape:[--lu-tabbar-padding:4px]',
].join(' ');

/*
 * Slides with a CSS transform transition (compositor only, no JS per frame).
 * Reduced motion: it jumps.
 */
const PILL =
  'absolute start-(--lu-tabbar-padding) top-(--lu-tabbar-padding) bottom-(--lu-tabbar-padding) w-[calc((100%-var(--lu-tabbar-padding)*2)/5)] rounded-[10px] bg-primary shadow-[inset_0_-3px_0_var(--ion-color-primary-shade)] transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none motion-reduce:duration-0';

const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** Longest the label waits for the pill, in case transitionend never fires (tab hidden, transition cut). */
const LIT_FALLBACK_MS = 400;

/**
 * Floating 5-tab bar inside a <nav> landmark. IonTabBar only renders
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
const TabBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
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
    <nav className={BAR} slot="bottom" aria-label={t('tabs.navLabel')}>
      <div className={PILL} data-testid="tab-pill" ref={pill} aria-hidden="true" hidden={index < 0} />
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
              if (i !== index) return;
              const content = document.querySelector<HTMLIonContentElement>(`[data-testid="page-${tab}"] ion-content`);
              void content?.scrollToTop(window.matchMedia(MOTION_OK).matches ? 300 : 0);
            }}
          >
            <IonIcon icon={icon} aria-hidden="true" />
            {/* Short labels fit a 320–390 px bar. Below 360 px they are visually hidden but still read out. */}
            <IonLabel>{t(`tabs.short.${tab}`)}</IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </nav>
  );
};

export default TabBar;
