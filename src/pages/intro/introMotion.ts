import { gsap } from 'gsap';

export type IntroSlide = 'numbers' | 'meaning' | 'goals';

/**
 * The intro's slide entrances, loaded on demand so GSAP stays out of the
 * first download (Intro is in the main bundle). Each slide's pieces fly in
 * from the side the member is moving toward, then their details play: icons
 * pop, the trend line draws, the bar fills, the medal spins in.
 *
 * `dir` is the direction of travel on screen: 1 = pieces enter from the
 * right, -1 = from the left (already flipped for Arabic by the caller).
 * `rtl` makes the goal bar fill from the right. Returns a cleanup that stops
 * the animation and restores the elements.
 */
export function enterSlide(root: HTMLElement, slide: IntroSlide, dir: 1 | -1, rtl: boolean): () => void {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('[data-intro-text] > *', { y: 18, opacity: 0, duration: 0.55, stagger: 0.08, clearProps: 'all' }, 0.12);

    if (slide === 'numbers') {
      tl.from(
        '.lu-intro-row',
        {
          x: 80 * dir,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'back.out(1.3)',
          clearProps: 'opacity,transform',
        },
        0,
      );
      tl.from(
        '.lu-intro-row .lu-disc',
        { scale: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(2.4)', clearProps: 'transform' },
        0.2,
      );
    } else if (slide === 'meaning') {
      tl.from(
        '[data-intro-card]',
        {
          x: 70 * dir,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'back.out(1.2)',
          clearProps: 'opacity,transform',
        },
        0,
      );
      tl.fromTo(
        '.lu-intro-spark polyline',
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', clearProps: 'stroke-dasharray,stroke-dashoffset' },
        0.3,
      );
      tl.from('.lu-intro-good', { scale: 0, duration: 0.6, ease: 'back.out(2.6)', clearProps: 'transform' }, 0.45);
    } else {
      tl.from(
        '[data-intro-card]',
        { x: 70 * dir, opacity: 0, duration: 0.7, ease: 'back.out(1.2)', clearProps: 'opacity,transform' },
        0,
      );
      tl.from(
        '[data-intro-card] .lu-bar > span',
        {
          scaleX: 0,
          transformOrigin: rtl ? '100% 50%' : '0% 50%',
          duration: 1.1,
          ease: 'expo.out',
          clearProps: 'transform,transform-origin',
        },
        0.25,
      );
      tl.from(
        '.lu-intro-medal',
        { scale: 0, rotation: -160, duration: 1.1, ease: 'elastic.out(1, 0.55)', clearProps: 'transform' },
        0.15,
      );
    }
  }, root);
  return () => ctx.revert();
}
