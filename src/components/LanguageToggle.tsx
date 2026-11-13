import { useTranslation } from 'react-i18next';

import { setLanguage } from '../i18n';
import './SoundToggle.css';

interface LanguageToggleProps {
  className?: string;
}

/**
 * Switches between English and Arabic. Shows the language you would switch to,
 * written in that language ("ع" / "EN"), so a member who can't read the
 * current one still finds it.
 */
const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const next = i18n.language === 'ar' ? 'en' : 'ar';

  return (
    <button
      type="button"
      className={['lu-sound-toggle', 'lu-lang-toggle', className].filter(Boolean).join(' ')}
      data-testid="language-toggle"
      aria-label={t(next === 'ar' ? 'language.switchToAr' : 'language.switchToEn')}
      onClick={(e) => {
        // The splash moves on when tapped anywhere; switching language must not.
        e.stopPropagation();
        void setLanguage(next);
      }}
    >
      <span lang={next} aria-hidden="true">
        {next === 'ar' ? 'ع' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;
