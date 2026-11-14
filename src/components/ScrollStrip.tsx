import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import './ScrollStrip.scss';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Classes for the outer wrapper (margins, width). `className` goes on the scrolling row itself. */
  outerClassName?: string;
}

/** Which ends of the row still hide items. */
interface Edges {
  start: boolean;
  end: boolean;
}

const same = (a: Edges, b: Edges) => a.start === b.start && a.end === b.end;

/**
 * A row that scrolls sideways and shows it: the side with more items fades
 * out under a small arrow that scrolls by most of a screen. Swiping still
 * works; the arrows are for mouse users and for spotting that there is more.
 * Keyboard users move with the row's own arrow keys, so the arrows are not
 * Tab stops.
 */
const ScrollStrip: React.FC<Props> = ({ outerClassName, className, children, ...rest }) => {
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>({ start: false, end: false });

  const measure = useCallback(() => {
    const el = row.current;
    if (!el) return;
    // In RTL scrollLeft runs from 0 to negative; its size is what matters.
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    const next = { start: pos > 2, end: pos < max - 2 };
    setEdges((prev) => (same(prev, next) ? prev : next));
  }, []);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const frame = requestAnimationFrame(measure);
    el.addEventListener('scroll', measure, { passive: true });
    // The row's content changes (another category's colors) as well as its size.
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    ro?.observe(el);
    const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(measure);
    mo?.observe(el, { childList: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', measure);
      ro?.disconnect();
      mo?.disconnect();
    };
  }, [measure]);

  /** Scrolls toward the end (1) or the start (-1) by most of the visible width. */
  const nudge = (toward: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: toward * (rtl ? -1 : 1) * el.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div
      className={['lu-strip-wrap relative min-w-0', outerClassName].filter(Boolean).join(' ')}
      data-more-start={edges.start || undefined}
      data-more-end={edges.end || undefined}
    >
      <div ref={row} className={['lu-strip', className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </div>
      {edges.start && (
        <button
          type="button"
          className="lu-strip-arrow lu-strip-arrow-start"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => nudge(-1)}
        >
          <IonIcon className="rtl:-scale-x-100" icon={chevronBack} />
        </button>
      )}
      {edges.end && (
        <button
          type="button"
          className="lu-strip-arrow lu-strip-arrow-end"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => nudge(1)}
          data-testid="strip-more"
        >
          <IonIcon className="rtl:-scale-x-100" icon={chevronForward} />
        </button>
      )}
    </div>
  );
};

export default ScrollStrip;
