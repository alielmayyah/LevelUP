import { IonPage } from '@ionic/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { getToken } from '../auth/token';
import { brand } from '../brand.config';
import SoundToggle from '../components/SoundToggle';
import { useSound } from '../sound/useSound';
import './Splash.css';

/**
 * First screen. Tapping anywhere moves on: to Login when signed out, straight
 * to Home when a session exists. The "Tap to Begin" button is the keyboard and
 * screen-reader way in; a tap on it bubbles up to the same handler.
 */
const Splash: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { play } = useSound();
  const leaving = useRef(false);

  const begin = async () => {
    if (leaving.current) return;
    leaving.current = true;
    play('tap');
    const token = await getToken();
    history.replace(token ? '/tabs/home' : '/login');
  };

  return (
    <IonPage className="lu-splash" data-testid="page-splash" onClick={() => void begin()}>
      <div className="lu-splash-stars" aria-hidden="true" />
      <SoundToggle className="lu-splash-sound" />
      <main className="lu-splash-body">
        <div className="lu-splash-ring">
          <img src={brand.mark} alt="" width={360} height={252} data-testid="splash-logo" />
        </div>
        <h1 className="lu-splash-name">{brand.name}</h1>
        <p className="lu-splash-tagline">{t('splash.tagline')}</p>
        <button type="button" className="lu-splash-cta">
          {t('splash.cta')}
        </button>
      </main>
    </IonPage>
  );
};

export default Splash;
