import { AnimatePresence, m } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { useSound } from '../sound/useSound';
import { CORNER_BUTTON } from './cornerControl';
import PixelIcon from './PixelIcon';

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
      className={[CORNER_BUTTON, 'text-[24px] leading-none', className].filter(Boolean).join(' ')}
      data-testid="sound-toggle"
      aria-label={t(enabled ? 'sound.mute' : 'sound.unmute')}
      aria-pressed={!enabled}
      onClick={(e) => {
        // The splash moves on when tapped anywhere; muting must not.
        e.stopPropagation();
        toggle();
      }}
    >
      {/* The icon swap is state-driven, so it uses Motion (see ui-standards → Animation). */}
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={enabled ? 'on' : 'off'}
          className="lu-sound-icon col-start-1 row-start-1 grid place-items-center"
          initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 25 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <PixelIcon name={enabled ? 'volume' : 'mute'} />
        </m.span>
      </AnimatePresence>
    </button>
  );
};

export default SoundToggle;
