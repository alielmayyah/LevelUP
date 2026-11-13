import { IonIcon } from '@ionic/react';
import {
  chevronForward,
  colorPaletteOutline,
  eyeOutline,
  languageOutline,
  logOutOutline,
  personOutline,
  podiumOutline,
  settingsOutline,
  volumeHighOutline,
} from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { saveSettings } from '../api/settings';
import type { ProfileDto, SettingsDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import { clearToken } from '../auth/token';
import { brand } from '../brand.config';
import CtaButton from '../components/CtaButton';
import PixelDialog from '../components/PixelDialog';
import PixelToast from '../components/PixelToast';
import { focusSibling, rovingTarget } from '../components/roving';
import TabPage from '../components/TabPage';
import { currentLanguage, setLanguage, type Lang } from '../i18n';
import { formatNumber } from '../i18n/format';
import { useSound } from '../sound/useSound';
import { getThemeMode, setTheme, type ThemeMode } from '../theme/theme';
import { ageOn } from './profile/age';
import './profile/Profile.css';

interface SwitchProps {
  checked: boolean;
  label: string;
  /** id of the one-line explanation under the label, read as the switch's description. */
  hintId: string;
  onChange: () => void;
  testId: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, label, hintId, onChange, testId }) => (
  <button
    type="button"
    role="switch"
    className="lu-switch"
    aria-checked={checked}
    aria-label={label}
    aria-describedby={hintId}
    data-testid={testId}
    onClick={onChange}
  />
);

interface ChoiceProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string; lang?: string }[];
  onChange: (v: T) => void;
  testId: string;
}

/** A small inline segmented choice (language, theme): one Tab stop, arrow keys to move. */
function Choice<T extends string>({ label, value, options, onChange, testId }: ChoiceProps<T>) {
  const { i18n } = useTranslation();
  return (
    <div className="lu-choice" role="radiogroup" aria-label={label} data-testid={testId}>
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          lang={o.lang}
          aria-checked={value === o.value}
          tabIndex={value === o.value ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => {
            const to = rovingTarget(e, i, options.length, i18n.dir() === 'rtl');
            if (to === null) return;
            onChange(options[to].value);
            focusSibling(e, to);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Profile tab: who the member is, their membership, and their settings. */
const Profile: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const me = useApi<ProfileDto>('/me');
  const sound = useSound();
  const [lang, setLang] = useState<Lang>(currentLanguage());
  const [theme, setThemeState] = useState<ThemeMode>(getThemeMode());
  const [saveFailed, setSaveFailed] = useState(false);
  const clearSaveFailed = useCallback(() => setSaveFailed(false), []);
  const [confirmOut, setConfirmOut] = useState(false);
  const [now] = useState(() => new Date());
  useRefreshOnEnter(me.reload);

  const p = me.status === 'ready' ? me.data : null;

  /** Flips a FitScore setting right away, then saves; on failure flips it back and says so. */
  const toggle = async (key: keyof SettingsDto) => {
    if (!p) return;
    const next = !p[key];
    me.setData((d) => ({ ...d, [key]: next }));
    try {
      await saveSettings({ [key]: next });
    } catch {
      me.setData((d) => ({ ...d, [key]: !next }));
      setSaveFailed(true);
    }
  };

  const signOut = async () => {
    await clearToken();
    history.replace('/login');
  };

  return (
    <TabPage testId="page-profile" title={t('tabs.profile')} subtitle={t('profile.subtitle')} onRefresh={me.reload}>
      {me.status === 'loading' && (
        <div className="lu-profile" aria-busy="true">
          <div className="lu-skeleton-card" />
          <div className="lu-skeleton-card" />
        </div>
      )}

      {me.status === 'error' && (
        <div className="lu-state" role="alert">
          <p>{t('profile.error')}</p>
          <CtaButton onClick={() => void me.retry()}>{t('common.retry')}</CtaButton>
        </div>
      )}

      {p && (
        <div className="lu-profile">
          <section className="lu-px-card lu-profile-id">
            <span className="lu-avatar lu-display" aria-hidden="true">
              {p.firstName.charAt(0)}
              {p.lastName.charAt(0)}
            </span>
            <div>
              <h2 className="lu-profile-name lu-display" data-testid="profile-name">
                {p.firstName} {p.lastName}
              </h2>
              <p className="lu-profile-fitid" dir="auto">
                {t('profile.fitId', { id: p.fitId })}
              </p>
            </div>
          </section>

          <section className="lu-px-card lu-rows" aria-labelledby="sec-personal">
            <h3 id="sec-personal" className="lu-row-section">
              <IonIcon icon={personOutline} aria-hidden="true" />
              {t('profile.personal')}
            </h3>
            <div className="lu-row">
              <span>{t('profile.age')}</span>
              <strong data-testid="profile-age">{formatNumber(ageOn(p.birthDate, now))}</strong>
            </div>
            <div className="lu-row">
              <span>{t('profile.height')}</span>
              <strong>
                {formatNumber(p.heightCm)} {t('units.cm')}
              </strong>
            </div>
          </section>

          <section className="lu-px-card lu-rows" aria-labelledby="sec-settings">
            <h3 id="sec-settings" className="lu-row-section">
              <IonIcon icon={settingsOutline} aria-hidden="true" />
              {t('profile.settings')}
            </h3>

            <div className="lu-row">
              <span className="lu-row-label">
                <IonIcon icon={languageOutline} aria-hidden="true" />
                {t('settings.language')}
              </span>
              <Choice
                testId="setting-language"
                label={t('settings.language')}
                value={lang}
                options={[
                  { value: 'en', label: 'English', lang: 'en' },
                  { value: 'ar', label: 'عربي', lang: 'ar' },
                ]}
                onChange={(l) => {
                  setLang(l);
                  void setLanguage(l);
                }}
              />
            </div>

            <div className="lu-row">
              <span className="lu-row-label">
                <IonIcon icon={colorPaletteOutline} aria-hidden="true" />
                {t('settings.theme')}
              </span>
              <Choice
                testId="setting-theme"
                label={t('settings.theme')}
                value={theme}
                options={(['system', 'light', 'dark'] as const).map((m) => ({ value: m, label: t(`theme.${m}`) }))}
                onChange={(m) => {
                  setThemeState(m);
                  void setTheme(m);
                }}
              />
            </div>

            <div className="lu-row">
              <span className="lu-row-label">
                <IonIcon icon={volumeHighOutline} aria-hidden="true" />
                <span>
                  {t('profile.sound')}
                  <small id="hint-sound">{t('profile.soundHint')}</small>
                </span>
              </span>
              <Switch
                testId="setting-sound"
                hintId="hint-sound"
                label={t('profile.sound')}
                checked={sound.enabled}
                onChange={sound.toggle}
              />
            </div>

            <div className="lu-row">
              <span className="lu-row-label">
                <IonIcon icon={eyeOutline} aria-hidden="true" />
                <span>
                  {t('profile.showFitScore')}
                  <small id="hint-show-fitscore">{t('profile.showFitScoreHint')}</small>
                </span>
              </span>
              <Switch
                testId="setting-show-fitscore"
                hintId="hint-show-fitscore"
                label={t('profile.showFitScore')}
                checked={p.showFitScore}
                onChange={() => void toggle('showFitScore')}
              />
            </div>

            <div className="lu-row">
              <span className="lu-row-label">
                <IonIcon icon={podiumOutline} aria-hidden="true" />
                <span>
                  {t('profile.leaderboard')}
                  <small id="hint-leaderboard">{t('profile.leaderboardHint')}</small>
                </span>
              </span>
              <Switch
                testId="setting-leaderboard"
                hintId="hint-leaderboard"
                label={t('profile.leaderboard')}
                checked={p.fitScoreOnLeaderboard}
                onChange={() => void toggle('fitScoreOnLeaderboard')}
              />
            </div>

            <button type="button" className="lu-row lu-row-button lu-signout" onClick={() => setConfirmOut(true)}>
              <span className="lu-row-label">
                <IonIcon icon={logOutOutline} aria-hidden="true" />
                {t('profile.signOut')}
              </span>
              <IonIcon className="lu-chevron" icon={chevronForward} aria-hidden="true" />
            </button>
          </section>
        </div>
      )}

      <PixelDialog
        open={confirmOut}
        title={t('profile.signOutConfirm', { name: brand.name })}
        cancelLabel={t('profile.cancel')}
        confirmLabel={t('profile.signOut')}
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => {
          setConfirmOut(false);
          void signOut();
        }}
      />
      <PixelToast message={saveFailed ? t('profile.saveFailed') : null} onDone={clearSaveFailed} />
    </TabPage>
  );
};

export default Profile;
