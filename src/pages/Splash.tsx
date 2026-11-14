import { IonPage } from '@ionic/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

import { getToken } from '../auth/token';
import { brand } from '../brand.config';
import { playIntroSoon } from '../sound/useSound';
import './Splash.scss';
import BarbellLoader from './splash/BarbellLoader';

const MOTION_OK = '(prefers-reduced-motion: no-preference)';
/** How long the logo shows before the app moves on by itself. */
export const SPLASH_MS = 1600;
/** Navigation still finishes if animation frames stall. */
const EXIT_MAX_MS = 600;

/**
 * Launch screen only: the logo on the dusk sky, then the app moves on by
 * itself, to Login when signed out or straight to Home with a session.
 * Nothing to tap, so there is no way to get stuck here.
 * `?stay` keeps it on screen (screenshots and accessibility checks).
 */
const Splash: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { search } = useLocation();
  const stage = useRef<HTMLDivElement>(null);
  const stay = new URLSearchParams(search).has('stay');

  // The chime plays as the logo arrives. If the browser holds audio until a tap, it plays on the
  // first tap while the splash is up; it stays silent when sound is off.
  useEffect(() => {
    let cancel = () => undefined as void;
    const t = window.setTimeout(() => (cancel = playIntroSoon()), 180);
    return () => {
      window.clearTimeout(t);
      cancel();
    };
  }, []);

  useEffect(() => {
    if (stay) return;
    let live = true;
    let undoExit: (() => void) | null = null;
    const motionOk = window.matchMedia(MOTION_OK).matches;
    // GSAP, for the exit, loads while the logo shows, so it stays out of the initial bundle.
    const motion = motionOk ? import('./splash/splashMotion') : null;

    const timer = window.setTimeout(async () => {
      const to = (await getToken()) ? '/tabs/home' : '/login';
      if (!live) return;
      const go = () => live && history.replace(to);
      const m = motion ? await motion.catch(() => null) : null;
      if (live && m && stage.current) undoExit = m.warpOut(stage.current, go, EXIT_MAX_MS);
      else go();
    }, SPLASH_MS);

    return () => {
      live = false;
      window.clearTimeout(timer);
      undoExit?.();
    };
  }, [history, stay]);

  return (
    <IonPage className="lu-splash overflow-hidden text-splash-text select-none" data-testid="page-splash">
      <div className="absolute inset-0 isolate ar:font-arabic" ref={stage}>
        <div
          className="lu-splash-stars pointer-events-none absolute inset-x-0 top-[4%] bottom-[4%]"
          aria-hidden="true"
        />
        <main className="relative box-border grid h-full content-center justify-items-center gap-8 pt-(--ion-safe-area-top,0px) pr-[calc(20px+var(--ion-safe-area-right,0px))] pb-(--ion-safe-area-bottom,0px) pl-[calc(20px+var(--ion-safe-area-left,0px))] text-center short-landscape:gap-5">
          <div className="lu-splash-brand relative w-[clamp(180px,min(73vw,37vh),308px)] max-w-full short-landscape:w-[clamp(120px,46vh,200px)]">
            {/* A soft glow that breathes behind the logo. */}
            <span className="lu-splash-glow pointer-events-none absolute inset-[-30%]" aria-hidden="true" />
            <h1
              className="relative m-0 drop-shadow-[0_2px_8px_var(--lu-splash-bg)]"
              aria-describedby="splash-brand-tagline"
            >
              <img
                className="block h-auto w-full"
                src={brand.logo}
                alt={brand.name}
                width={480}
                height={414}
                data-testid="splash-logo"
              />
              {/* A streak of light sweeps across the logo once, masked to its shape. */}
              <span
                className="lu-splash-shine pointer-events-none absolute inset-0"
                style={{ maskImage: `url(${brand.logo})`, WebkitMaskImage: `url(${brand.logo})` }}
                aria-hidden="true"
              />
            </h1>
            <span id="splash-brand-tagline" hidden>
              {t('splash.tagline')}
            </span>
          </div>
          {/* "Loading the bar": plates slide onto a pixel barbell in step with the splash's timer. */}
          <BarbellLoader label={t('splash.loading')} durationMs={SPLASH_MS} />
        </main>
      </div>
    </IonPage>
  );
};

export default Splash;
