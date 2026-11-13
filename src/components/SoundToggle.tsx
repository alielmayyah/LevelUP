import { IonIcon } from '@ionic/react';
import { volumeHighOutline, volumeMuteOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import { useSound } from '../sound/useSound';
import './SoundToggle.css';

interface SoundToggleProps {
  className?: string;
}

/** Icon button that mutes or unmutes every app sound. Reused on Splash, Login, and Profile. */
const SoundToggle: React.FC<SoundToggleProps> = ({ className }) => {
  const { t } = useTranslation();
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      className={['lu-sound-toggle', className].filter(Boolean).join(' ')}
      data-testid="sound-toggle"
      aria-label={t(enabled ? 'sound.mute' : 'sound.unmute')}
      aria-pressed={!enabled}
      onClick={(e) => {
        // The splash moves on when tapped anywhere; muting must not.
        e.stopPropagation();
        toggle();
      }}
    >
      <IonIcon icon={enabled ? volumeHighOutline : volumeMuteOutline} aria-hidden="true" />
    </button>
  );
};

export default SoundToggle;
