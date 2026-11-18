import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { saveSettings } from '../api/settings';
import type { ProfileDto, SettingsDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import { clearToken } from '../auth/token';
import Icon, { type IconName } from '../components/Icon';
import { brand } from '../brand.config';
import { features } from '../features';
import Dialog from '../components/Dialog';
import Toast from '../components/Toast';
import { focusSibling, rovingTarget } from '../components/roving';
import TabPage from '../components/TabPage';
import { currentLanguage, setLanguage, type Lang } from '../i18n';
import { useSound } from '../sound/useSound';
import { getThemeMode, setTheme, type ThemeMode } from '../theme/theme';

/** One settings line: label on one side, value or control on the other; wraps on narrow screens. */
const ROW = 'flex min-h-[60px] flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2 font-semibold';
/** Rows are split by a thin rule, except the last one. */
const RULED = '[border-block-end:1px_solid_var(--lu-border)] last:[border-block-end:0]';
const LABEL = 'flex min-w-0 items-center gap-2.5 font-semibold';
/** Each row's icon sits in a small tinted badge, like the rest of the app. */
const LABEL_ICON = 'lu-settings-icon box-content flex-none rounded-[10px] p-1.5 text-[1.1rem]';
const HINT = 'text-[0.8rem] font-normal text-muted';

/** A label with an icon, and optionally a one-line hint under it. */
const RowLabel: React.FC<{ icon: IconName; children: React.ReactNode; hint?: { id: string; text: string } }> = ({
  icon,
  children,
  hint,
}) => (
  // A row with a hint holds a switch: the label shrinks and wraps so the switch stays on the same line.
  <span className={`${LABEL} text-ink ${hint ? 'flex-1 basis-0' : ''}`}>
    <Icon className={`${LABEL_ICON} text-muted`} name={icon} />
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

const SECTION = 'mx-0 mt-3 mb-1 text-[0.75rem] font-semibold text-muted';

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
      className="lu-choice inline-flex gap-0.5 rounded-full bg-surface-2 p-0.5"
      role="radiogroup"
      aria-label={label}
      data-testid={testId}
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          className="min-h-11 min-w-11 cursor-pointer rounded-full border-0 bg-transparent px-3 py-0 font-inherit text-[0.8rem] font-semibold text-muted transition-colors duration-[180ms] ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-checked:bg-ink aria-checked:text-surface motion-reduce:transition-none"
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

/** App preferences and member privacy controls. */
const Settings: React.FC = () => {
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
    <TabPage testId="page-settings" title={t('profile.settings')} backTo="/tabs/profile" onRefresh={me.reload} fill>
      {/*
       * Language, theme and sound live on this device, so they show at once,
       * even while /me loads or after it fails. Only the FitScore switches wait for it.
       * Rows keep their natural height (no stretching to fill the screen); Sign out follows the card.
       */}
      <div className="mx-auto flex w-full max-w-[620px] flex-col gap-3.5">
        <section className="lu-card flex flex-col py-1.5" aria-labelledby="sec-settings">
          <h2 id="sec-settings" className={SECTION}>
            {t('profile.preferences')}
          </h2>

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

          {me.status === 'loading' && (
            <div className={`${ROW} ${RULED}`} aria-busy="true" data-testid="settings-fitscore-loading">
              <span className="lu-skeleton-card min-h-10 w-full" />
            </div>
          )}

          {me.status === 'error' && (
            <div className={`${ROW} ${RULED}`} role="alert" data-testid="settings-fitscore-error">
              <span className="min-w-0 flex-1 text-[0.875rem] font-normal text-muted">{t('profile.error')}</span>
              <button type="button" className="lu-link-button flex-none" onClick={() => void me.retry()}>
                {t('common.retry')}
              </button>
            </div>
          )}

          {p && (
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
          )}

          {p && features.community && (
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
          )}
        </section>

        {/* Sign out stands on its own, below the settings. */}
        <button
          type="button"
          className="lu-card lu-signout flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 font-inherit font-semibold text-danger"
          onClick={() => setConfirmOut(true)}
          data-testid="sign-out"
        >
          <span className={`${LABEL} text-danger`}>
            <Icon className={`${LABEL_ICON} lu-settings-icon-danger rtl:-scale-x-100`} name="logout" />
            {t('profile.signOut')}
          </span>
          <Icon className="lu-chevron text-danger" name="chevronForward" />
        </button>
      </div>

      <Dialog
        open={confirmOut}
        title={t('profile.signOutConfirm', { name: brand.name })}
        message={t('profile.signOutNote')}
        cancelLabel={t('profile.cancel')}
        confirmLabel={t('profile.signOut')}
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => {
          setConfirmOut(false);
          void signOut();
        }}
      />
      <Toast message={saveFailed ? t('profile.saveFailed') : null} onDone={clearSaveFailed} />
    </TabPage>
  );
};

export default Settings;
