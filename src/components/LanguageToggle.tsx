import { useTranslation } from 'react-i18next';

import { setLanguage } from '../i18n';
import { CORNER_BUTTON } from './cornerControl';

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
      className={[CORNER_BUTTON, 'text-base leading-none font-bold', className].filter(Boolean).join(' ')}
      data-testid="language-toggle"
      aria-label={t(next === 'ar' ? 'language.switchToAr' : 'language.switchToEn')}
      onClick={(e) => {
        // The splash moves on when tapped anywhere; switching language must not.
        e.stopPropagation();
        void setLanguage(next);
      }}
    >
      <span lang={next} aria-hidden="true" className="ar:font-arabic ar:text-[1.3rem]">
        {next === 'ar' ? 'ع' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;
