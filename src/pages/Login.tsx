import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { arrowForward, idCardOutline, informationCircleOutline } from 'ionicons/icons';
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
import { useSound } from '../sound/useSound';
import gymScene from './assets/splash-gym.webp';
import './Login.css';

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
    <IonPage className="lu-login" data-testid="page-login">
      <IonContent className="lu-login-content" scrollY>
        <div className="lu-login-layout">
          {/* First in the page so keyboard focus follows the visual order: top corner, then the form (WCAG 2.4.3). */}
          <div className="lu-corner-controls">
            <LanguageToggle />
            <SoundToggle />
          </div>
          <div className="lu-login-hero" aria-hidden="true">
            <img className="lu-login-scene" src={gymScene} alt="" width={1344} height={896} />
            <div className="lu-login-lockup">
              <img className="lu-login-logo" src={brand.logo} alt="" width={480} height={414} />
            </div>
          </div>

          <form className="lu-login-form" onSubmit={(e) => void submit(e)} noValidate>
            <h1 className="lu-login-title">{t('login.welcome', { name: brand.name })}</h1>

            <label className="lu-login-label" htmlFor={inputId}>
              <IonIcon icon={idCardOutline} aria-hidden="true" />
              {t('login.fitId')}
            </label>
            <input
              id={inputId}
              className="lu-login-input"
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
            <div className="lu-login-hint-slot" id={hintId} aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {failure ? (
                  <m.p
                    key={failure}
                    className="lu-login-hint lu-login-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                  >
                    <IonIcon icon={informationCircleOutline} aria-hidden="true" />
                    {t(`login.${failure}`)}
                  </m.p>
                ) : (
                  <m.p
                    key="help"
                    className="lu-login-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                  >
                    <IonIcon icon={informationCircleOutline} aria-hidden="true" />
                    {t('login.help')}
                  </m.p>
                )}
              </AnimatePresence>
            </div>

            <CtaButton type="submit" className="lu-login-submit" disabled={!ready || busy} aria-busy={busy}>
              {busy ? (
                <>
                  <IonSpinner name="crescent" aria-hidden="true" />
                  <span className="lu-login-sr">{t('login.signingIn')}</span>
                </>
              ) : (
                <>
                  {t('login.submit')}
                  <IonIcon className="lu-login-submit-icon" icon={arrowForward} aria-hidden="true" />
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
