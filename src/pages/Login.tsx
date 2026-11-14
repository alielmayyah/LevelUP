import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { arrowBack, arrowForward, idCardOutline, informationCircleOutline } from 'ionicons/icons';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { api, ApiError } from '../api/client';
import type { LoginRequest, LoginResponse } from '../api/types';
import { getToken, setToken } from '../auth/token';
import { brand } from '../brand.config';
import CtaButton from '../components/CtaButton';
import LanguageToggle from '../components/LanguageToggle';
import SoundToggle from '../components/SoundToggle';
import { CORNER_BUTTON, CORNER_CONTROLS, CORNER_START } from '../components/cornerControl';
import { useSound } from '../sound/useSound';
import gymScene from './assets/splash-gym.webp';
import './Login.scss';

const MIN_DIGITS = 3;
const MAX_DIGITS = 8;

type Failure = 'notFound' | 'tooMany' | 'failed';

const failureOf = (err: unknown): Failure => {
  if (err instanceof ApiError && err.status === 401) return 'notFound';
  if (err instanceof ApiError && err.status === 429) return 'tooMany';
  return 'failed';
};

/** Fit ID sign-in. One numeric field, no password: the front desk hands out the ID. */
const Login: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { play } = useSound();
  const [fitId, setFitId] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const ids = useId();
  const inputId = `${ids}-fit-id`;
  const hintId = `${ids}-hint`;

  // A member who is already signed in never sees this screen.
  useEffect(() => {
    let live = true;
    void getToken().then((token) => live && token && history.replace('/tabs/home'));
    return () => {
      live = false;
    };
  }, [history]);

  const ready = fitId.length >= MIN_DIGITS && fitId.length <= MAX_DIGITS;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setFailure(null);
    try {
      const body: LoginRequest = { fitId };
      const res = await api<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) });
      await setToken(res.accessToken);
      play('success');
      history.replace('/tabs/home');
    } catch (err) {
      setFailure(failureOf(err));
      setBusy(false);
    }
  };

  return (
    <IonPage className="text-splash-text" data-testid="page-login">
      <IonContent className="[--background:var(--lu-splash-bg)] [--color:var(--lu-splash-text)] ar:font-arabic" scrollY>
        <div className="relative grid min-h-full grid-rows-[auto_1fr] split:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] split:grid-rows-[1fr] wide:grid-cols-[minmax(0,1fr)_minmax(400px,40%)]">
          {/*
           * Back to the splash. iPhones have no hardware back button, so every
           * screen that isn't a tab carries its own way out. First in the page so
           * keyboard focus follows the visual order (WCAG 2.4.3).
           */}
          <div className={CORNER_START}>
            <button
              type="button"
              className={CORNER_BUTTON}
              aria-label={t('login.back')}
              onClick={() => history.replace('/splash')}
              data-testid="login-back"
            >
              <IonIcon className="text-[1.25rem] rtl:-scale-x-100" icon={arrowBack} aria-hidden="true" />
            </button>
          </div>
          <div className={CORNER_CONTROLS}>
            <LanguageToggle />
            <SoundToggle />
          </div>
          <div
            className="lu-login-hero relative h-[calc(clamp(220px,44vh,420px)+var(--ion-safe-area-top,0px))] overflow-hidden split:h-auto split:min-h-full"
            aria-hidden="true"
          >
            <img
              className="absolute inset-0 size-full object-cover object-[68%_100%]"
              src={gymScene}
              alt=""
              width={1344}
              height={896}
            />
            <div className="absolute inset-x-0 top-0 z-1 grid justify-items-center gap-0.5 pt-[calc(clamp(14px,3vh,32px)+var(--ion-safe-area-top,0px))]">
              <img
                className="block h-auto w-[clamp(120px,22vh,210px)] drop-shadow-[0_2px_8px_var(--lu-splash-bg)] short-landscape:w-[clamp(110px,40vh,180px)]"
                src={brand.logo}
                alt=""
                width={480}
                height={414}
              />
            </div>
          </div>

          <form
            className="box-border flex w-[min(100%,460px)] flex-col justify-self-center pt-1 pr-[calc(20px+var(--ion-safe-area-right,0px))] pb-[calc(24px+var(--ion-safe-area-bottom,0px))] pl-[calc(20px+var(--ion-safe-area-left,0px))] split:self-center split:pt-[calc(16px+var(--ion-safe-area-top,0px))] split:pb-[calc(16px+var(--ion-safe-area-bottom,0px))]"
            onSubmit={(e) => void submit(e)}
            noValidate
          >
            <h1 className="m-0 mb-5 text-start text-[clamp(1.5rem,6.5vw,2rem)] leading-[1.2] font-extrabold short-landscape:mb-2.5 short-landscape:text-[1.35rem]">
              {t('login.welcome', { name: brand.name })}
            </h1>

            <label
              className="mb-2 flex items-center gap-1.5 text-[0.9rem] font-bold text-splash-muted"
              htmlFor={inputId}
            >
              <IonIcon className="text-[1.15rem]" icon={idCardOutline} aria-hidden="true" />
              {t('login.fitId')}
            </label>
            <input
              id={inputId}
              className="lu-login-input box-border min-h-14 w-full rounded-xl px-4 py-0 text-[1.35rem] font-bold tracking-[0.14em] text-splash-text tabular-nums rtl:text-end short-landscape:min-h-12"
              data-testid="fit-id"
              dir="ltr"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="username"
              // The phone keyboard's action key reads "Go" and submits.
              enterKeyHint="go"
              maxLength={MAX_DIGITS}
              value={fitId}
              aria-invalid={failure === 'notFound'}
              aria-describedby={hintId}
              onChange={(e) => {
                setFitId(e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS));
                setFailure(null);
              }}
            />

            {/* The helper and the error share one slot so the button never jumps. */}
            <div className="min-h-[3.2em] short-landscape:min-h-[2.6em]" id={hintId} aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {failure ? (
                  <m.p
                    key={failure}
                    className="mx-0 mt-2 mb-0 flex items-start gap-1.5 text-[0.875rem] leading-[1.4] font-semibold text-splash-danger"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                  >
                    <IonIcon
                      className="mt-[0.1em] flex-none text-[1.05rem]"
                      icon={informationCircleOutline}
                      aria-hidden="true"
                    />
                    {t(`login.${failure}`)}
                  </m.p>
                ) : (
                  <m.p
                    key="help"
                    className="mx-0 mt-2 mb-0 flex items-start gap-1.5 text-[0.875rem] leading-[1.4] text-splash-muted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                  >
                    <IonIcon
                      className="mt-[0.1em] flex-none text-[1.05rem]"
                      icon={informationCircleOutline}
                      aria-hidden="true"
                    />
                    {t('login.help')}
                  </m.p>
                )}
              </AnimatePresence>
            </div>

            <CtaButton
              type="submit"
              className="mt-4 w-full short-landscape:mt-2 short-landscape:min-h-12"
              disabled={!ready || busy}
              aria-busy={busy}
            >
              {busy ? (
                <>
                  <IonSpinner name="crescent" aria-hidden="true" />
                  <span className="sr-only">{t('login.signingIn')}</span>
                </>
              ) : (
                <>
                  {t('login.submit')}
                  <IonIcon className="text-[1.2rem] rtl:-scale-x-100" icon={arrowForward} aria-hidden="true" />
                </>
              )}
            </CtaButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
