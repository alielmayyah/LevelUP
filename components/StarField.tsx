import type { CSSProperties } from "react";

interface Star {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  maxOpacity: number;
}

// Integer-only PRNG (mulberry32): bitwise/imul ops are spec-exact on every
// JS engine, unlike Math.sin, which can differ in its last bit between
// Node's V8 and a browser's V8 and trigger SSR/client hydration mismatches.
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(count: number, intensity: number): Star[] {
  const rand = mulberry32(1337);

  return Array.from({ length: count }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 2,
    duration: 2 + rand() * 3,
    delay: rand() * 4,
    maxOpacity: (0.4 + rand() * 0.6) * intensity,
  }));
}

interface StarFieldProps {
  /** Star count. Lower for a subtler, background-only feel. */
  count?: number;
  /** Multiplier on each star's peak opacity (0-1). */
  intensity?: number;
  /** The big soft primary-colored glow behind the stars. Off when a parent already provides one. */
  glow?: boolean;
}

export function StarField({ count = 40, intensity = 1, glow = true }: StarFieldProps) {
  const stars = generateStars(count, intensity);

  return (
    <div className="pointer-events-none absolute inset-0">
      {glow && (
        <div className="absolute left-1/2 top-1/2 h-144 w-xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      )}
      {stars.map((star, i) => (
        <span
          key={i}
          className="lu-star absolute rounded-full bg-white"
          style={
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              "--lu-star-duration": `${star.duration}s`,
              "--lu-star-delay": `${star.delay}s`,
              "--lu-star-max": star.maxOpacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
