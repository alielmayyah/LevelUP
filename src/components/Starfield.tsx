import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  layer: 0 | 1 | 2;
}

interface ShootingStar {
  x: number;
  y: number;
  start: number;
}

/** Drift in px per second for the far, middle, and near layers (parallax). */
const DRIFT = [2.5, 5, 9] as const;
const RADIUS = [0.55, 0.9, 1.4] as const;
const BRIGHTNESS = [0.35, 0.6, 0.9] as const;
const SHOOT_MS = 900;
const SHOOT_LENGTH = 110;
const TAIL_SEGMENTS = 14;
const MAX_STARS = 420;

/** Small seeded generator, so the sky looks the same on every visit. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const wrap = (value: number, size: number) => ((value % size) + size) % size;

/**
 * A night sky on a canvas: hundreds of randomly placed stars at three depths
 * that twinkle and drift at different speeds, plus an occasional shooting
 * star. Under reduced motion it draws one still frame. The star color comes
 * from the --lu-splash-star token.
 */
const Starfield: React.FC<{ className?: string }> = ({ className }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Ionic builds a page before attaching it, so the token is read once the canvas is in the document.
    let color = '';
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shooting: ShootingStar | null = null;
    let nextShoot = 2500;
    let frame = 0;
    const random = seeded(7);

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(MAX_STARS, Math.round((width * height) / 2600));
      stars = Array.from({ length: count }, () => {
        const roll = random();
        const layer = roll < 0.6 ? 0 : roll < 0.9 ? 1 : 2;
        return {
          x: random() * width,
          y: random() * height,
          r: RADIUS[layer] * (0.7 + random() * 0.6),
          alpha: BRIGHTNESS[layer] * (0.6 + random() * 0.4),
          twinkleSpeed: 0.4 + random() * 1.6,
          phase: random() * Math.PI * 2,
          layer,
        };
      });
    };

    const draw = (now: number) => {
      const moving = !still.matches;
      const seconds = now / 1000;
      ctx.clearRect(0, 0, width, height);
      color ||= getComputedStyle(canvas).getPropertyValue('--lu-splash-star').trim();
      if (!color || !stars.length) return;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      for (const star of stars) {
        const twinkle = moving ? 0.65 + 0.35 * Math.sin(seconds * star.twinkleSpeed + star.phase) : 1;
        const x = moving ? wrap(star.x - seconds * DRIFT[star.layer], width) : star.x;
        const y = moving ? wrap(star.y - seconds * DRIFT[star.layer] * 0.35, height) : star.y;
        ctx.globalAlpha = star.alpha * twinkle;
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (star.layer === 2) {
          // A soft halo makes the nearest stars read as brighter, not just bigger.
          ctx.globalAlpha = star.alpha * twinkle * 0.14;
          ctx.beginPath();
          ctx.arc(x, y, star.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (moving && !shooting && now > nextShoot) {
        shooting = { x: width * (0.45 + random() * 0.55), y: height * random() * 0.3, start: now };
        nextShoot = now + 7000 + random() * 8000;
      }
      if (shooting) {
        const p = (now - shooting.start) / SHOOT_MS;
        if (p >= 1) shooting = null;
        else {
          // Eases in and out, and the tail tapers and fades behind a bright head.
          const ease = Math.sin(Math.PI * p);
          const headX = shooting.x - p * 260;
          const headY = shooting.y + p * 130;
          const tail = SHOOT_LENGTH * (0.4 + 0.6 * ease);
          for (let i = 0; i < TAIL_SEGMENTS; i++) {
            const a = i / TAIL_SEGMENTS;
            const b = (i + 1) / TAIL_SEGMENTS;
            ctx.globalAlpha = ease * 0.9 * (1 - a) ** 2;
            ctx.lineWidth = 1.6 * (1 - a) + 0.2;
            ctx.beginPath();
            ctx.moveTo(headX + tail * 0.9 * a, headY - tail * 0.45 * a);
            ctx.lineTo(headX + tail * 0.9 * b, headY - tail * 0.45 * b);
            ctx.stroke();
          }
          ctx.globalAlpha = ease;
          ctx.beginPath();
          ctx.arc(headX, headY, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (still.matches) draw(0);
      else frame = requestAnimationFrame(loop);
    };

    build();
    start();
    const resize = new ResizeObserver(() => {
      build();
      if (still.matches) draw(0);
    });
    resize.observe(canvas);
    still.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      still.removeEventListener('change', start);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
};

export default Starfield;
