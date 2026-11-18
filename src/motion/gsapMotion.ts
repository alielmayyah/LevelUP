import { useGSAP } from '@gsap/react';
import { useIonViewWillEnter } from '@ionic/react';
import { gsap } from 'gsap';
import { useRef, useState, type RefObject } from 'react';

import { formatNumber } from '../i18n/format';

gsap.registerPlugin(useGSAP);

/*
 * The app's GSAP motion layer, shared by the tab pages (all lazy chunks, so
 * GSAP never lands in the first download). Every effect:
 * - runs inside useGSAP with a scope, so it is reverted on unmount;
 * - runs only under (prefers-reduced-motion: no-preference); otherwise the
 *   rendered end state simply stays;
 * - animates transform and opacity only (never visibility), and leaves no
 *   inline style behind, so content is readable if the animation never runs.
 */

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** The house curve: a fast start that settles softly. */
export const EASE_OUT = 'expo.out';

const motionOk = () => typeof window !== 'undefined' && window.matchMedia?.(MOTION_OK).matches;

/* ---------- Press: every card and button springs back when let go ---------- */

/** Big things a member presses: they dip only slightly, or the whole screen seems to wobble. */
const CARDS = 'button.lu-card, a.lu-card, .lu-goal, .lu-goal-choice, .lu-metric-row';

/** Things a member presses. Login and intro (main bundle) keep their CSS press. */
const PRESSABLE = [
  'button.lu-card',
  'a.lu-card',
  '.lu-cta',
  '.lu-icon-button',
  '.lu-goal',
  '.lu-goal-choice',
  '.lu-segment button',
  '.lu-choice button',
  '.lu-hero-button',
  '.lu-all-scans',
  '.lu-metric-row',
].join(',');

let pressReady = false;
/** One listener for the whole app, added the first time a tab page loads. */
function installPress(): void {
  if (pressReady || typeof document === 'undefined') return;
  pressReady = true;
  let held: Element | null = null;
  const release = () => {
    const el = held;
    held = null;
    if (!el || !motionOk()) return;
    gsap.to(el, {
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.45)',
      overwrite: 'auto',
      clearProps: 'scale,transform',
    });
  };
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (!motionOk() || !(e.target instanceof Element)) return;
      const el = e.target.closest(PRESSABLE);
      if (!el || (el as HTMLButtonElement).disabled) return;
      held = el;
      gsap.to(el, { scale: el.matches(CARDS) ? 0.98 : 0.94, duration: 0.14, ease: 'power2.out', overwrite: 'auto' });
    },
    { passive: true },
  );
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
}

/* ---------- Tab visits ---------- */

/**
 * Counts how many times the member has come back to this page (0 on the
 * first visit). Effects that depend on it replay when the tab is opened again,
 * so a page builds itself up every time it is shown.
 */
export function useEnterCount(): number {
  const [count, setCount] = useState(0);
  const first = useRef(true);
  useIonViewWillEnter(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (motionOk()) setCount((n) => n + 1);
  }, []);
  return count;
}

/* ---------- Entrances ---------- */

/** Elements that have already played their entrance, so a data refresh doesn't replay it. */
const revealed = new WeakSet<Element>();

/**
 * How many entrances are running in each scope. The scope carries
 * data-revealing while any of them runs, so tests can wait for final colors
 * (a newer entrance can still be running when an older one ends).
 */
const running = new WeakMap<Element, number>();
const markRunning = (root: Element, delta: 1 | -1) => {
  const n = Math.max(0, (running.get(root) ?? 0) + delta);
  running.set(root, n);
  if (n > 0) root.setAttribute('data-revealing', '');
  else root.removeAttribute('data-revealing');
};

/** What happens inside a section as it lands: list items cascade, icons pop, bars fill, lines draw, end dots land. */
function playInner(tl: gsap.core.Timeline, items: Element[], at: number, rtl: boolean): void {
  const inside = (sel: string) => items.flatMap((el) => Array.from(el.querySelectorAll<Element>(sel)));
  // Lists marked data-stagger: their items follow one another instead of arriving as one block.
  const rows = inside('[data-stagger] > *');
  if (rows.length)
    tl.from(
      rows,
      { opacity: 0, y: 16, duration: 0.5, stagger: 0.07, ease: 'power3.out', clearProps: 'opacity,transform' },
      at - 0.1,
    );
  const pops = inside('[data-pop]');
  if (pops.length)
    tl.from(
      pops,
      { scale: 0.5, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(1.8)', clearProps: 'opacity,transform' },
      at + 0.1,
    );
  const bars = inside('[data-grow]');
  if (bars.length)
    tl.from(
      bars,
      {
        scaleX: 0,
        transformOrigin: rtl ? '100% 50%' : '0% 50%',
        duration: 1.2,
        stagger: 0.08,
        ease: 'expo.out',
        clearProps: 'transform,transform-origin',
      },
      at + 0.1,
    );
  // Lines draw from their start (the elements set pathLength={1}).
  const lines = inside('[data-draw]');
  if (lines.length)
    tl.fromTo(
      lines,
      { strokeDasharray: 1, strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: 1.3,
        stagger: 0.1,
        ease: 'power2.inOut',
        clearProps: 'stroke-dasharray,stroke-dashoffset',
      },
      at + 0.1,
    );
  const dots = inside('[data-dot]');
  if (dots.length)
    tl.from(
      dots,
      {
        scale: 0,
        transformOrigin: '50% 50%',
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(3)',
        clearProps: 'transform',
      },
      at + 1,
    );
}

/**
 * Entrance for the direct children of `scope` (or the elements matching
 * `selector` inside it): each one slides up a little and fades in, one after
 * another (no tilt or scale: straight and clean), then its icons pop (`data-pop`), bars fill (`data-grow`),
 * lines draw (`data-draw`) and end dots land (`data-dot`). Sections below the
 * fold wait until they scroll into view. Plays when new children appear
 * (`key` changes), and again, lighter, each time the tab is opened.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, key: unknown, selector = ':scope > *'): void {
  installPress();
  const visits = useEnterCount();
  const lastVisit = useRef(0);

  useGSAP(
    (_context, contextSafe) => {
      const root = scope.current;
      if (!root) return;
      const replay = visits !== lastVisit.current;
      lastVisit.current = visits;
      const all = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute('hidden'));
      const items = replay ? all : all.filter((el) => !revealed.has(el));
      if (!items.length) return;
      items.forEach((el) => revealed.add(el));
      let finished = false;
      let counted = false;
      const done = () => {
        if (!counted) return;
        counted = false;
        markRunning(root, -1);
      };
      let observer: IntersectionObserver | null = null;

      gsap.matchMedia().add(MOTION_OK, () => {
        const rtl = getComputedStyle(root).direction === 'rtl';
        const bottom = window.innerHeight;
        const now = items.filter((el) => el.getBoundingClientRect().top < bottom);
        const later = items.filter((el) => el.getBoundingClientRect().top >= bottom);

        counted = true;
        markRunning(root, 1);
        const tl = gsap.timeline({
          onComplete: () => {
            finished = true;
            done();
          },
        });
        if (now.length) {
          tl.from(
            now,
            replay
              ? { opacity: 0, y: 10, duration: 0.4, stagger: 0.04, ease: 'power3.out' }
              : { opacity: 0, y: 22, duration: 0.65, stagger: 0.06, ease: 'power3.out' },
          );
          tl.set(now, { clearProps: 'opacity,transform' });
          // A tab visit replays only the slide; bars and icons are already where they belong.
          if (!replay) playInner(tl, now, 0.15, rtl);
        }

        // Below the fold: hidden only while off screen, they rise in as they scroll into view.
        if (later.length && 'IntersectionObserver' in window && contextSafe) {
          gsap.set(later, { opacity: 0, y: 28 });
          const land = contextSafe((el: Element) => {
            const t = gsap.timeline();
            t.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'opacity,transform' });
            playInner(t, [el], 0.1, rtl);
          });
          const io = new IntersectionObserver(
            (entries) =>
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                land(entry.target);
              }),
            { rootMargin: '0px 0px -8% 0px' },
          );
          later.forEach((el) => io.observe(el));
          observer = io;
        }
        return () => {
          observer?.disconnect();
          observer = null;
        };
      });
      // Stopped before the end (Strict Mode's test unmount, a quick tab switch):
      // let these elements play their entrance next time.
      return () => {
        observer?.disconnect();
        done();
        if (!finished) items.forEach((el) => revealed.delete(el));
      };
    },
    { scope, dependencies: [key, visits] },
  );
}

/* ---------- Numbers ---------- */

/**
 * Counts a number up to `value` in the element `target` points at, from 0 on
 * the first show and on every tab visit, and from the last shown value when
 * the data changes. It lands with a small bounce. React keeps rendering the
 * final text; the tween only paints frames over it, and puts the final text
 * back if it is stopped early.
 */
export function useCountUp(
  target: RefObject<HTMLElement | null>,
  value: number | null | undefined,
  format: (n: number) => string = (n) => formatNumber(Math.round(n)),
  duration = 1.2,
): void {
  const shown = useRef(0);
  const visits = useEnterCount();
  const lastVisit = useRef(0);
  useGSAP(
    () => {
      if (value == null) return;
      if (visits !== lastVisit.current) shown.current = 0;
      lastVisit.current = visits;
      const from = shown.current;
      if (from === value) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        const counter = { value: from };
        // Paint into React's own text node, so a later render (a language
        // switch, say) still updates the text that is on screen.
        const paint = (n: number) => {
          const el = target.current;
          if (!el) return;
          const node = el.firstChild;
          if (node && node.nodeType === Node.TEXT_NODE && !node.nextSibling) node.nodeValue = format(n);
          else el.textContent = format(n);
        };
        paint(from);
        const el = target.current;
        const tl = gsap.timeline({
          onComplete: () => {
            shown.current = value;
          },
        });
        tl.to(counter, { value, duration, ease: 'expo.out', onUpdate: () => paint(counter.value) });
        // The number lands with a little bounce.
        if (el)
          tl.to(
            el,
            {
              keyframes: [
                { scale: 1.12, duration: 0.14, ease: 'power2.out' },
                { scale: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.35)' },
              ],
              transformOrigin: '50% 60%',
              clearProps: 'transform',
            },
            duration * 0.45,
          );
        return () => {
          shown.current = counter.value;
          paint(value);
        };
      });
    },
    { dependencies: [value, visits] },
  );
}

export { gsap, useGSAP };
