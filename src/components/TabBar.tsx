import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { pillTransform, tabIndex, TABS } from './tabConfig';
import './TabBar.css';

const MOTION_OK = '(prefers-reduced-motion: no-preference)';

type Gsap = typeof import('gsap').gsap;

/**
 * Floating 5-tab bar inside a <nav> landmark. IonTabBar only renders
 * IonTabButton children, so the sliding pill sits beside it.
 *
 * Each tab is named by its visible label (WCAG 2.5.3, label in name). Ionic
 * puts role="tab" on the button's inner link; an aria-label on the button
 * itself would be copied onto the outer element too, which breaks the tab
 * list's structure for screen readers.
 *
 * The pill glides with GSAP (loaded in the background, so it stays out of the
 * initial bundle). A label turns white only once the pill is under it, so text
 * never sits white-on-white mid-move.
 */
const TabBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const index = tabIndex(pathname);
  const rtl = i18n.dir() === 'rtl';

  const pill = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const shown = useRef({ index: Math.max(index, 0), rtl });
  const gsapRef = useRef<Gsap | null>(null);
  /** The tab whose label is drawn on the pill (white). Lags the route until the pill arrives. */
  const [lit, setLit] = useState(index);

  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    let live = true;
    void import('gsap').then((m) => {
      if (live) gsapRef.current = m.gsap;
    });
    return () => {
      live = false;
    };
  }, []);

  // Place the pill before paint on first render and whenever it should jump.
  useLayoutEffect(() => {
    const el = pill.current;
    if (!el) return;
    const to = Math.max(index, 0);
    const from = shown.current;
    const g = gsapRef.current;
    const animate = g && index >= 0 && from.index !== to && from.rtl === rtl && window.matchMedia(MOTION_OK).matches;
    shown.current = { index: to, rtl };

    if (!animate) {
      g?.killTweensOf(el);
      el.style.transform = pillTransform(to, rtl);
      setLit(index);
      return;
    }

    const sign = rtl ? -1 : 1;
    const buttons = [...(bar.current?.querySelectorAll('ion-tab-button') ?? [])];
    let current = from.index;
    // Every frame, the label the pill's center is over is the white one, so a label
    // is white only while the purple pill is under it (never white on the white bar).
    const followPill = () => {
      const r = el.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const over = buttons.findIndex((b) => {
        const br = b.getBoundingClientRect();
        return center >= br.left && center < br.right;
      });
      if (over >= 0 && over !== current) {
        current = over;
        setLit(over);
      }
    };
    g.killTweensOf(el);
    const tl = g.timeline({
      onComplete: () => {
        // Hand the final position back as a plain transform the rest of the app (and tests) can read.
        g.set(el, { clearProps: 'transform' });
        el.style.transform = pillTransform(to, rtl);
        setLit(index);
      },
    });
    tl.fromTo(
      el,
      { xPercent: from.index * 100 * sign },
      { xPercent: to * 100 * sign, duration: 0.42, ease: 'power3.inOut', onUpdate: followPill },
      0,
    );
    // A little stretch while it travels, then it settles back to size.
    tl.to(el, { scaleX: 1.14, duration: 0.21, ease: 'sine.out', yoyo: true, repeat: 1 }, 0);
    // The tapped icon hops once.
    const icon = bar.current?.querySelector(`[data-testid="tab-${TABS[to].tab}"] ion-icon`);
    if (icon) tl.fromTo(icon, { y: 0 }, { y: -4, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, 0.18);
  }, [index, rtl]);

  return (
    <nav ref={bar} className="lu-tabbar" slot="bottom" aria-label={t('tabs.navLabel')}>
      <div className="lu-tab-pill" data-testid="tab-pill" ref={pill} aria-hidden="true" hidden={index < 0} />
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
