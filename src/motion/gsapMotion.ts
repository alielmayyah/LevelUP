import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef, type RefObject } from 'react';

import { formatNumber } from '../i18n/format';

gsap.registerPlugin(useGSAP);

/*
 * The app's GSAP motion layer, shared by the tab pages (all lazy chunks, so
 * GSAP never lands in the first download). Every effect:
 * - runs inside useGSAP with a scope, so it is reverted on unmount;
 * - runs only under (prefers-reduced-motion: no-preference); otherwise the
 *   rendered end state simply stays;
 * - animates transform and opacity only, and leaves no inline style behind,
 *   so content is readable if the animation never runs.
 */

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** The house curve: a quick start that settles softly. */
export const EASE_OUT = 'power3.out';

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

/**
 * Staggered entrance for the direct children of `scope` (or the elements
 * matching `selector` inside it): each rises a few pixels and fades in, one
 * after another. Bars marked `data-grow` fill from their start edge, and
 * elements marked `data-pop` scale in. Runs again when `key` changes, but
 * each element only ever enters once.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, key: unknown, selector = ':scope > *'): void {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !revealed.has(el) && !el.hasAttribute('hidden'),
      );
      if (!items.length) return;
      items.forEach((el) => revealed.add(el));
      let finished = false;
      let counted = false;
      const done = () => {
        if (!counted) return;
        counted = false;
        markRunning(root, -1);
      };

      gsap.matchMedia().add(MOTION_OK, () => {
        const rtl = getComputedStyle(root).direction === 'rtl';
        counted = true;
        markRunning(root, 1);
        const tl = gsap.timeline({
          defaults: { ease: EASE_OUT },
          onComplete: () => {
            finished = true;
            done();
          },
        });
        tl.from(items, {
          y: 22,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.07,
          clearProps: 'transform,opacity,visibility',
        });
        const bars = items.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>('[data-grow]')));
        if (bars.length)
          tl.from(
            bars,
            {
              scaleX: 0,
              transformOrigin: rtl ? '100% 50%' : '0% 50%',
              duration: 0.9,
              stagger: 0.06,
              ease: 'power2.out',
              clearProps: 'transform,transform-origin',
            },
            0.2,
          );
        const pops = items.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>('[data-pop]')));
        if (pops.length)
          tl.from(
            pops,
            { scale: 0.6, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(2)', clearProps: 'all' },
            0.25,
          );
      });
      // Stopped before the end (Strict Mode's test unmount, a quick tab switch):
      // let these elements play their entrance next time.
      return () => {
        done();
        if (!finished) items.forEach((el) => revealed.delete(el));
      };
    },
    { scope, dependencies: [key] },
  );
}

/**
 * Counts a number up to `value` in the element `target` points at, starting
 * from 0 the first time and from the last shown value afterwards. React keeps
 * rendering the final text; the tween only paints frames over it, and puts the
 * final text back if it is stopped early.
 */
export function useCountUp(
  target: RefObject<HTMLElement | null>,
  value: number | null | undefined,
  format: (n: number) => string = (n) => formatNumber(Math.round(n)),
  duration = 0.9,
): void {
  const shown = useRef(0);
  useGSAP(
    () => {
      if (value == null) return;
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
        gsap.to(counter, {
          value,
          duration,
          ease: 'power2.out',
          onUpdate: () => paint(counter.value),
          onComplete: () => {
            shown.current = value;
          },
        });
        return () => {
          shown.current = counter.value;
          paint(value);
        };
      });
    },
    { dependencies: [value] },
  );
}

export { gsap, useGSAP };
