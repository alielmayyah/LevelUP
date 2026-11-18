import { useRef, type ReactNode } from 'react';

import { gsap, MOTION_OK, useEnterCount, useGSAP } from '../../motion/gsapMotion';

export interface RingPart {
  key: string;
  /** Share of the whole, any unit (kg); parts are drawn in proportion. */
  value: number;
  /** The part's color, a CSS variable (var(--lu-muscle)). */
  color: string;
}

/** Gap between two parts, in hundredths of the ring. */
const GAP = 1.6;
const R = 42;

/**
 * What the body weight is made of, as a ring of colored parts (water,
 * protein, minerals, fat) with the weight in its middle. The parts sweep in
 * one after another, clockwise from the top (counter-clockwise in Arabic).
 */
const CompositionRing: React.FC<{ parts: RingPart[]; label: string; children: ReactNode }> = ({
  parts,
  label,
  children,
}) => {
  const box = useRef<HTMLDivElement>(null);
  const visits = useEnterCount();
  const total = parts.reduce((sum, p) => sum + Math.max(0, p.value), 0);
  const shares = parts.map((p) => (total > 0 ? (Math.max(0, p.value) / total) * 100 : 0));
  const arcs = parts.map((p, i) => ({
    ...p,
    // Each part starts where the ones before it end.
    offset: -shares.slice(0, i).reduce((sum, s) => sum + s, 0),
    length: Math.max(0, shares[i] - GAP),
  }));

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const tl = gsap.timeline({ delay: 0.25 });
        box.current?.querySelectorAll<SVGCircleElement>('.lu-ring-part').forEach((el, i) => {
          const length = Number(el.dataset.length);
          tl.fromTo(
            el,
            { strokeDasharray: `0 100` },
            {
              strokeDasharray: `${length} ${100 - length}`,
              duration: 0.55,
              ease: 'power2.inOut',
              // Ends on the value React set, so nothing needs clearing.
            },
            i === 0 ? 0 : '>-0.12',
          );
        });
        const center = box.current?.querySelector('.lu-ring-center');
        if (center)
          tl.from(center, { scale: 0.7, opacity: 0, duration: 0.8, ease: 'back.out(2)', clearProps: 'all' }, 0.1);
      });
    },
    { scope: box, dependencies: [total, visits] },
  );

  return (
    <div className="lu-ring relative aspect-square w-[clamp(132px,40vw,172px)] flex-none" ref={box}>
      <svg className="block size-full" viewBox="0 0 100 100" role="img" aria-label={label}>
        <circle className="lu-ring-track" cx="50" cy="50" r={R} pathLength={100} />
        {arcs.map((a) => (
          <circle
            key={a.key}
            className="lu-ring-part"
            cx="50"
            cy="50"
            r={R}
            pathLength={100}
            data-length={a.length}
            style={{ stroke: a.color, strokeDasharray: `${a.length} ${100 - a.length}`, strokeDashoffset: a.offset }}
          />
        ))}
      </svg>
      <div className="lu-ring-center absolute inset-[16%] grid place-content-center justify-items-center text-center">
        {children}
      </div>
    </div>
  );
};

export default CompositionRing;
