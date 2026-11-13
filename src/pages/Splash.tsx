import { useGSAP } from '@gsap/react';
import { IonPage } from '@ionic/react';
import { gsap } from 'gsap';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { getToken } from '../auth/token';
import { brand } from '../brand.config';
import SoundToggle from '../components/SoundToggle';
import { useSound } from '../sound/useSound';
import './Splash.css';

gsap.registerPlugin(useGSAP);

const MOTION_OK = '(prefers-reduced-motion: no-preference)';
/** The intro runs about 1.4 s; past this it jumps to the end. */
const INTRO_MAX_MS = 2000;
/** The exit runs about 0.55 s; past this it navigates anyway. */
const EXIT_MAX_MS = 600;

/**
 * First screen. Tapping anywhere moves on: to Login when signed out, straight
 * to Home when a session exists. The "Tap to Begin" button is the keyboard and
 * screen-reader way in; a tap on it bubbles up to the same handler.
 *
 * The intro and the exit are scripted sequences, so they use GSAP. The idle
 * loops (star drift, glow pulse, button breathing) stay in CSS.
 */
const Splash: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { play } = useSound();
  const stage = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  /** Set inside the GSAP context below; null under reduced motion. */
  const warpOut = useRef<((onDone: () => void) => void) | null>(null);

  useGSAP(
    (_context, contextSafe) => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const intro = gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.lu-splash-stars', { opacity: 0, duration: 1.2 }, 0)
          .from('.lu-splash-ring', { scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.15)
          .from('.lu-splash-ring img', { y: 18, opacity: 0, duration: 0.7 }, 0.45)
          .from(
            ['.lu-splash-name', '.lu-splash-tagline', '.lu-splash-cta'],
            { y: 16, opacity: 0, duration: 0.6, stagger: 0.12 },
            0.6,
          )
          .from('.lu-splash-sound', { opacity: 0, duration: 0.5 }, 0.9);

        // GSAP runs on requestAnimationFrame, which a busy or backgrounded browser can
        // pause. A plain timer makes sure the content is never left hidden.
        const settle = window.setTimeout(() => intro.progress(1), INTRO_MAX_MS);

        // Warps out in ≤ 0.55 s: the stars rush past and the ring zooms through.
        warpOut.current = contextSafe!((onDone: () => void) => {
          window.clearTimeout(settle);
          intro.kill();
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            onDone();
          };
          // Same reason: navigation never waits on a stalled animation frame.
          window.setTimeout(finish, EXIT_MAX_MS);
          gsap
            .timeline({ defaults: { ease: 'power2.in' }, onComplete: finish })
            .to(
              ['.lu-splash-name', '.lu-splash-tagline', '.lu-splash-cta', '.lu-splash-sound'],
              { opacity: 0, y: -10, duration: 0.25, stagger: 0.03 },
              0,
            )
            .to('.lu-splash-ring', { scale: 1.4, opacity: 0, duration: 0.45 }, 0.05)
            .to('.lu-splash-stars', { scale: 2.2, opacity: 0, duration: 0.5 }, 0);
        });
        return () => {
          window.clearTimeout(settle);
          warpOut.current = null;
        };
      });
    },
    { scope: stage },
  );

  const begin = async () => {
    if (leaving.current) return;
    leaving.current = true;
    play('tap');
    const to = (await getToken()) ? '/tabs/home' : '/login';
    const go = () => history.replace(to);
    if (warpOut.current) warpOut.current(go);
    else go();
  };

  return (
    <IonPage className="lu-splash" data-testid="page-splash" onClick={() => void begin()}>
      <div className="lu-splash-stage" ref={stage}>
        <div className="lu-splash-stars" aria-hidden="true" />
        <SoundToggle className="lu-splash-sound" />
        <main className="lu-splash-body">
          <div className="lu-splash-ring">
            <img src={brand.mark} alt="" width={360} height={252} data-testid="splash-logo" />
          </div>
          <h1 className="lu-splash-name">{brand.name}</h1>
          <p className="lu-splash-tagline">{t('splash.tagline')}</p>
          <button type="button" className="lu-splash-cta">
            <span>{t('splash.cta')}</span>
          </button>
        </main>
      </div>
    </IonPage>
  );
};

export default Splash;
