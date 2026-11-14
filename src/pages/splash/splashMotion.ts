import { gsap } from 'gsap';

/**
 * The splash's exit: the logo zooms through and everything fades.
 * Loaded on demand so GSAP stays out of the initial bundle.
 * Navigation never waits longer than `maxMs`, even if animation frames stall.
 * Returns a cleanup that stops the timer and restores the elements.
 */
export function warpOut(stage: HTMLElement, onDone: () => void, maxMs: number): () => void {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    onDone();
  };
  const timer = window.setTimeout(finish, maxMs);
  const ctx = gsap.context(() => {
    gsap
      .timeline({ defaults: { duration: 0.3, ease: 'power2.in' }, onComplete: finish })
      .to('.lu-splash-brand', { scale: 1.08, opacity: 0 }, 0)
      .to(['.lu-splash-glow', '.lu-splash-stars', '.lu-splash-cta', '.lu-splash-sound'], { opacity: 0 }, 0);
  }, stage);
  return () => {
    window.clearTimeout(timer);
    ctx.revert();
  };
}
