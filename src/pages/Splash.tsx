import { IonPage } from '@ionic/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { getToken } from '../auth/token';
import { brand } from '../brand.config';
import CtaButton from '../components/CtaButton';
import LanguageToggle from '../components/LanguageToggle';
import SoundToggle from '../components/SoundToggle';
import { CORNER_CONTROLS } from '../components/cornerControl';
import { useSound } from '../sound/useSound';
import './Splash.scss';

const MOTION_OK = '(prefers-reduced-motion: no-preference)';
/** Navigation still finishes if animation frames stall. */
const EXIT_MAX_MS = 600;

/**
 * First screen. Tapping anywhere moves on: to Login when signed out, straight
 * to Home when a session exists. The "Tap to Begin" button is the keyboard and
 * screen-reader way in; a tap on it bubbles up to the same handler.
 */
const Splash: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { play } = useSound();
  const stage = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  /** The exit animation module, once loaded; stays null under reduced motion. */
  const motion = useRef<typeof import('./splash/splashMotion') | null>(null);
  const undoExit = useRef<(() => void) | null>(null);

  // The intro is plain CSS (Splash.scss). GSAP, for the exit, loads in the
  // background so it is out of the initial bundle but ready before a tap.
  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    let live = true;
    void import('./splash/splashMotion').then((m) => {
      if (live) motion.current = m;
    });
    return () => {
      live = false;
      undoExit.current?.();
    };
  }, []);

  const begin = async () => {
    if (leaving.current) return;
    leaving.current = true;
    play('tap');
    const to = (await getToken()) ? '/tabs/home' : '/login';
    const go = () => history.replace(to);
    const m = motion.current;
    if (m && stage.current && window.matchMedia(MOTION_OK).matches)
      undoExit.current = m.warpOut(stage.current, go, EXIT_MAX_MS);
    else go();
  };

  return (
    <IonPage
      className="lu-splash cursor-pointer overflow-hidden text-splash-text select-none"
      data-testid="page-splash"
      onClick={() => void begin()}
    >
      <div className="absolute inset-0 isolate ar:font-arabic" ref={stage}>
        <div
          className="lu-splash-stars pointer-events-none absolute inset-x-0 top-[4%] bottom-[4%]"
          aria-hidden="true"
        />
        <div className={`lu-splash-sound ${CORNER_CONTROLS}`}>
          <LanguageToggle />
          <SoundToggle />
        </div>
        <main className="relative box-border grid h-full content-center justify-items-center gap-[clamp(32px,7vh,64px)] pt-[calc(clamp(55px,11vh,96px)+var(--ion-safe-area-top,0px))] pr-[calc(20px+var(--ion-safe-area-right,0px))] pb-[calc(clamp(16px,3.5vh,32px)+var(--ion-safe-area-bottom,0px))] pl-[calc(20px+var(--ion-safe-area-left,0px))] text-center short-landscape:gap-5 short-landscape:pt-[calc(22px+var(--ion-safe-area-top,0px))]">
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
            </h1>
            <span id="splash-brand-tagline" hidden>
              {t('splash.tagline')}
            </span>
          </div>
          {/* Right under the logo, with a pulsing ring that invites the first tap. */}
          <div className="lu-splash-cta-ring relative grid w-[min(86%,300px)] short-landscape:w-[min(60%,270px)]">
            <CtaButton className="lu-splash-cta w-full">{t('splash.cta')}</CtaButton>
          </div>
        </main>
      </div>
    </IonPage>
  );
};

export default Splash;
