import { useEffect, useRef } from 'react';

const LINES = 38;
const STEP_PX = 6;

/**
 * Flowing silk ribbon: many thin lines that follow the same slow wave, each a
 * little offset from the next, blended so overlaps glow. Colors come from the
 * brand primary and secondary tokens. Under reduced motion it draws one still
 * frame.
 */
const Waves: React.FC<{ className?: string }> = ({ className }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Ionic builds a page before attaching it, so tokens are read once the canvas is in the document.
    let primary = '';
    let secondary = '';
    const readColors = () => {
      const css = getComputedStyle(canvas);
      primary = css.getPropertyValue('--ion-color-primary').trim();
      secondary = css.getPropertyValue('--ion-color-secondary').trim();
      return primary !== '' && secondary !== '';
    };
    let width = 0;
    let height = 0;
    let frame = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);
      if (!width || (!primary && !readColors())) return;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, primary);
      gradient.addColorStop(0.55, secondary);
      gradient.addColorStop(1, primary);
      ctx.strokeStyle = gradient;

      // Wave size follows the box, so it looks the same on a phone and a monitor.
      const amp = Math.min(height * 0.22, 140);
      const k = (Math.PI * 2) / Math.max(width * 0.9, 320);
      const mid = height * 0.5;
      const spread = Math.min(height * 0.3, 160);

      for (let i = 0; i < LINES; i++) {
        const f = i / (LINES - 1);
        // Brightest through the middle of the ribbon, fading at both edges.
        ctx.globalAlpha = 0.08 + 0.5 * Math.sin(Math.PI * f) ** 2;
        ctx.beginPath();
        for (let x = -STEP_PX; x <= width + STEP_PX; x += STEP_PX) {
          const y =
            mid +
            (f - 0.5) * spread * (0.6 + 0.4 * Math.sin(x * k * 0.7 + t * 0.3)) +
            amp * Math.sin(x * k + t * 0.45 + f * 1.1) * 0.6 +
            amp * Math.sin(x * k * 1.9 - t * 0.3 + f * 2.4) * 0.25 -
            (x / width) * amp * 0.5;
          if (x === -STEP_PX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (still.matches) draw(4000);
      else frame = requestAnimationFrame(loop);
    };

    build();
    start();
    const resize = new ResizeObserver(() => {
      build();
      if (still.matches) draw(4000);
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

export default Waves;
