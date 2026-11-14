import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';

import { saveSettings } from '../api/settings';
import type { ProfileDto, SettingsDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import { clearToken } from '../auth/token';
import Avatar from '../avatar/Avatar';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import { starterAvatar } from '../avatar/catalog';
import '../avatar/avatar.scss';
import { brand } from '../brand.config';
import CtaButton from '../components/CtaButton';
import PixelDialog from '../components/PixelDialog';
import PixelToast from '../components/PixelToast';
import { focusSibling, rovingTarget } from '../components/roving';
import TabPage from '../components/TabPage';
import { currentLanguage, setLanguage, type Lang } from '../i18n';
import { useSound } from '../sound/useSound';
import { getThemeMode, setTheme, type ThemeMode } from '../theme/theme';

const GRID = 'grid gap-3.5 wide:grid-cols-[1fr_1fr] wide:items-start';
/** One settings line: label on one side, value or control on the other; wraps on narrow screens. */
const ROW = 'flex min-h-[52px] flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2 font-semibold';
/** Rows are split by a thin rule, except the last one. */
const RULED = '[border-block-end:2px_solid_var(--lu-surface-2)] last:[border-block-end:0]';
const LABEL = 'flex min-w-0 items-center gap-2.5 font-bold';
const LABEL_ICON = 'flex-none text-[1.2rem]';
const HINT = 'text-[0.8rem] font-semibold text-muted';

/** A label with an icon, and optionally a one-line hint under it. */
const RowLabel: React.FC<{ icon: PixelIconName; children: React.ReactNode; hint?: { id: string; text: string } }> = ({
  icon,
  children,
  hint,
}) => (
  // A row with a hint holds a switch: the label shrinks and wraps so the switch stays on the same line.
  <span className={`${LABEL} text-ink ${hint ? 'flex-1 basis-0' : ''}`}>
    <PixelIcon className={`${LABEL_ICON} text-muted`} name={icon} />
    {hint ? (
      <span className="grid">
        {children}
        <small id={hint.id} className={HINT}>
          {hint.text}
        </small>
      </span>
    ) : (
      children
    )}
  </span>
);

const SECTION =
  'mx-0 mt-3 mb-1 flex items-center gap-2 text-[0.8rem] font-extrabold tracking-[0.08em] text-primary uppercase dark:text-secondary ar:text-[0.9rem] ar:tracking-normal';

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
    className="lu-switch flex-none"
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
    <div
      className="lu-choice inline-flex gap-0.5 rounded-lg border-2 border-line bg-surface-2 p-0.5"
      role="radiogroup"
      aria-label={label}
      data-testid={testId}
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          className="min-h-9 min-w-11 cursor-pointer rounded-md border-0 bg-transparent px-2.5 py-0 font-inherit text-[0.8rem] font-extrabold text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-checked:bg-primary aria-checked:text-primary-contrast"
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
    <TabPage
      fill
      testId="page-profile"
      title={t('tabs.profile')}
      titleIcon={<PixelIcon className="lu-title-icon flex-none text-[0.75em]" name="person" />}
      subtitle={t('profile.subtitle')}
      onRefresh={me.reload}
    >
      {me.status === 'loading' && (
        <div className={GRID} aria-busy="true">
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
        // The settings card stretches to the tab bar, with Sign out at its foot.
        <div className={`${GRID} flex-1 grid-rows-[auto_1fr_auto] wide:grid-rows-[auto_1fr_auto]`}>
          <section className="lu-px-card flex items-center gap-3.5 wide:col-span-full">
            <span className="lu-avatar-frame block size-[72px] flex-none overflow-hidden rounded-[12px]">
              <Avatar
                config={p.avatar ?? starterAvatar(String(p.memberId))}
                className="block size-full"
                testId="profile-avatar"
              />
            </span>
            <div className="min-w-0">
              <h2 className="lu-display m-0 text-[2rem] leading-[1.1]" data-testid="profile-name">
                {p.firstName} {p.lastName}
              </h2>
              <p className="mx-0 mt-1 mb-0 font-bold text-muted" dir="auto">
                {t('profile.fitId', { id: p.fitId })}
              </p>
              <Link
                to="/tabs/profile/character"
                className="lu-link-button -ms-2.5 mt-1 inline-flex items-center gap-1.5 no-underline"
                data-testid="customize-character"
              >
                <PixelIcon name="brush" />
                {t('profile.customize')}
              </Link>
            </div>
          </section>

          {/* The rows spread out to fill the card, so the settings don't bunch up at the top. */}
          <section className="lu-px-card flex flex-col justify-between py-1.5" aria-labelledby="sec-settings">
            <h3 id="sec-settings" className={SECTION}>
              <PixelIcon name="settings" />
              {t('profile.settings')}
            </h3>

            <div className={`${ROW} ${RULED} text-muted`}>
              <RowLabel icon="globe">{t('settings.language')}</RowLabel>
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

            <div className={`${ROW} ${RULED} text-muted`}>
              <RowLabel icon="palette">{t('settings.theme')}</RowLabel>
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

            <div className={`${ROW} ${RULED} text-muted`}>
              <RowLabel icon="volume" hint={{ id: 'hint-sound', text: t('profile.soundHint') }}>
                {t('profile.sound')}
              </RowLabel>
              <Switch
                testId="setting-sound"
                hintId="hint-sound"
                label={t('profile.sound')}
                checked={sound.enabled}
                onChange={sound.toggle}
              />
            </div>

            <div className={`${ROW} ${RULED} text-muted`}>
              <RowLabel icon="eye" hint={{ id: 'hint-show-fitscore', text: t('profile.showFitScoreHint') }}>
                {t('profile.showFitScore')}
              </RowLabel>
              <Switch
                testId="setting-show-fitscore"
                hintId="hint-show-fitscore"
                label={t('profile.showFitScore')}
                checked={p.showFitScore}
                onChange={() => void toggle('showFitScore')}
              />
            </div>

            <div className={`${ROW} ${RULED} text-muted`}>
              <RowLabel icon="podium" hint={{ id: 'hint-leaderboard', text: t('profile.leaderboardHint') }}>
                {t('profile.leaderboard')}
              </RowLabel>
              <Switch
                testId="setting-leaderboard"
                hintId="hint-leaderboard"
                label={t('profile.leaderboard')}
                checked={p.fitScoreOnLeaderboard}
                onChange={() => void toggle('fitScoreOnLeaderboard')}
              />
            </div>
          </section>

          {/* Sign out stands on its own, below the settings. */}
          <button
            type="button"
            className="lu-px-card lu-signout flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 font-inherit font-semibold text-danger"
            onClick={() => setConfirmOut(true)}
            data-testid="sign-out"
          >
            <span className={`${LABEL} text-danger`}>
              <PixelIcon className={`${LABEL_ICON} text-danger`} name="logout" />
              {t('profile.signOut')}
            </span>
            <PixelIcon className="lu-chevron text-danger" name="chevronForward" />
          </button>
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
