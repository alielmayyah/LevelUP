import { IonContent, IonIcon, IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { arrowBack, checkmark, refreshOutline, shuffleOutline } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveAvatar } from '../api/avatar';
import type { AvatarConfigDto, ProfileDto } from '../api/types';
import { useApi } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import {
  CUSTOMIZER_TABS,
  MATCH_HAIR,
  presetsFor,
  randomAvatar,
  sameAvatar,
  starterAvatar,
  stylesFor,
  type ColorPart,
  type CustomizerTab,
  type ResolvedStyles,
  type StylePart,
} from '../avatar/catalog';
import { CustomizerIcon, OutfitPicker, StylePicker } from '../avatar/StylePicker';
import CtaButton from '../components/CtaButton';
import PixelDialog from '../components/PixelDialog';
import PixelToast from '../components/PixelToast';
import { focusSibling, rovingTarget } from '../components/roving';
import '../avatar/avatar.scss';

const COLORS: Record<Exclude<CustomizerTab, 'outfits'>, readonly ColorPart[]> = {
  hair: ['hair'],
  body: ['skin'],
  top: ['tank'],
  pants: ['shorts'],
  shoes: ['shoes'],
  beard: ['beard'],
  face: ['eyes', 'smile'],
};

interface SwatchesProps {
  part: ColorPart;
  value: string;
  onChange: (id: string) => void;
}

/** One part's colors: a radio group with one Tab stop and arrow keys, each swatch named by its color. */
const Swatches: React.FC<SwatchesProps> = ({ part, value, onChange }) => {
  const { t, i18n } = useTranslation();
  const palette = presetsFor(part);
  const presets = part === 'beard' ? [{ id: MATCH_HAIR, color: undefined }, ...palette] : palette;
  const labelId = `swatch-${part}`;
  return (
    <div className="grid gap-1.5" data-testid={`part-${part}`}>
      <p id={labelId} className="m-0 flex flex-wrap items-baseline gap-x-2 font-bold text-ink">
        {t(`avatar.part.${part}`)}
        <span className="text-[0.8rem] font-semibold text-muted" aria-hidden="true">
          {t(`avatar.color.${value}`)}
        </span>
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {presets.map((preset, i) => {
          const on = preset.id === value;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t(`avatar.color.${preset.id}`)}
              tabIndex={on ? 0 : -1}
              className="lu-swatch relative grid size-11 cursor-pointer place-items-center rounded-[10px] border-2 border-line bg-surface-2 p-0 text-ink aria-checked:border-ink"
              style={{ backgroundColor: preset.color }}
              onClick={() => onChange(preset.id)}
              onKeyDown={(e) => {
                const to = rovingTarget(e, i, presets.length, i18n.dir() === 'rtl');
                if (to === null) return;
                onChange(presets[to].id);
                focusSibling(e, to);
              }}
            >
              {preset.id === MATCH_HAIR && <CustomizerIcon tab="hair" />}
              {on && (
                <IonIcon
                  className={
                    preset.id === MATCH_HAIR
                      ? 'absolute inset-e-0.5 inset-bs-0.5 text-[0.8rem]'
                      : 'lu-swatch-check text-[1.1rem]'
                  }
                  icon={checkmark}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Style and color choices share one live preview and one saved character.
 */
const Character: React.FC = () => {
  const { t, i18n } = useTranslation();
  const router = useIonRouter();
  const me = useApi<ProfileDto>('/me');
  const p = me.status === 'ready' ? me.data : null;

  /** What the member has now: their saved character, or their starter. */
  const saved = useMemo<AvatarConfigDto | null>(
    () => (p ? (p.avatar ?? starterAvatar(String(p.memberId))) : null),
    [p],
  );
  /** Unsaved edits; null means the draft is the saved character. */
  const [edits, setEdits] = useState<AvatarConfigDto | null>(null);
  const [active, setActive] = useState<CustomizerTab>('outfits');
  useIonViewWillEnter(() => setActive('outfits'));
  const draft = edits ?? saved;
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const clearFailed = useCallback(() => setFailed(false), []);

  const dirty = !!draft && !!saved && !sameAvatar(draft, saved);

  const leave = useCallback(() => {
    if (router.canGoBack()) router.goBack();
    else router.push('/tabs/profile', 'back', 'replace');
  }, [router]);

  const back = useCallback(() => (dirty ? setConfirmLeave(true) : leave()), [dirty, leave]);

  // Android back asks first too when there are unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBack = (e: Event) =>
      (e as CustomEvent<{ register: (priority: number, handler: () => void) => void }>).detail.register(100, () =>
        setConfirmLeave(true),
      );
    document.addEventListener('ionBackButton', onBack);
    return () => document.removeEventListener('ionBackButton', onBack);
  }, [dirty]);

  const setPart = (part: ColorPart, id: string) => {
    if (draft) setEdits({ ...draft, colors: { ...draft.colors, [part]: id } });
  };

  const setStyle = <K extends StylePart>(part: K, id: ResolvedStyles[K]) => {
    if (draft) setEdits({ ...draft, styles: { ...stylesFor(draft.styles), [part]: id } });
  };

  const save = async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      const result = await saveAvatar(draft);
      me.setData((d) => ({ ...d, avatar: result }));
      setEdits(null);
      leave();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage data-testid="page-character">
      <IonContent>
        <div className="lu-page-body lu-tab-body">
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              className="lu-icon-button"
              onClick={back}
              aria-label={t('avatar.back')}
              data-testid="character-back"
            >
              <IonIcon className="rtl:-scale-x-100" icon={arrowBack} aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="lu-display m-0 text-[clamp(2rem,9vw,2.75rem)] leading-[1.05] wrap-anywhere text-ink">
                {t('avatar.title')}
              </h1>
              <p className="mx-0 mt-1 mb-0 text-[0.9rem] text-muted">{t('avatar.subtitle')}</p>
            </div>
          </div>

          {me.status === 'loading' && <div className="lu-skeleton-card" aria-busy="true" />}

          {me.status === 'error' && (
            <div className="lu-state" role="alert">
              <p>{t('avatar.error')}</p>
              <CtaButton onClick={() => void me.retry()}>{t('common.retry')}</CtaButton>
            </div>
          )}

          {draft && (
            <div className="grid gap-3.5 split:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] split:items-start">
              <section
                className="lu-px-card lu-avatar-stage grid place-items-center p-3 split:sticky split:top-[calc(var(--ion-safe-area-top,0px)+1rem)]"
                aria-label={t('avatar.preview')}
              >
                <Avatar
                  config={draft}
                  crop="full"
                  label={t('avatar.preview')}
                  testId="character-preview"
                  className="block h-[min(25vh,230px)] w-auto max-w-full short-landscape:h-[52vh] split:h-[min(60vh,440px)]"
                />
              </section>

              <div className="grid min-w-0 gap-3.5">
                <section className="lu-px-card grid gap-3 p-2.5 sm:p-3.5" aria-label={t('avatar.customize')}>
                  <div
                    role="tablist"
                    aria-label={t('avatar.customize')}
                    className="grid grid-cols-4 gap-1 wide:grid-cols-8"
                  >
                    {CUSTOMIZER_TABS.map((tab, i) => (
                      <button
                        key={tab}
                        id={`avatar-tab-${tab}`}
                        type="button"
                        role="tab"
                        aria-controls={`avatar-panel-${tab}`}
                        aria-selected={tab === active}
                        tabIndex={tab === active ? 0 : -1}
                        className="lu-customizer-tab grid min-h-12 min-w-0 cursor-pointer place-items-center content-center gap-1 rounded-[6px] border-2 border-transparent px-0.5 py-1.5 text-[0.72rem] leading-tight font-bold wrap-anywhere aria-selected:border-primary"
                        onClick={() => setActive(tab)}
                        onKeyDown={(e) => {
                          const to = rovingTarget(e, i, CUSTOMIZER_TABS.length, i18n.dir() === 'rtl');
                          if (to === null) return;
                          setActive(CUSTOMIZER_TABS[to]);
                          focusSibling(e, to);
                        }}
                      >
                        <CustomizerIcon tab={tab} />
                        {t(`avatar.tab.${tab}`)}
                      </button>
                    ))}
                  </div>
                  {CUSTOMIZER_TABS.map((tab) => (
                    <div
                      key={tab}
                      id={`avatar-panel-${tab}`}
                      role="tabpanel"
                      aria-labelledby={`avatar-tab-${tab}`}
                      hidden={tab !== active}
                    >
                      {tab === active &&
                        (active === 'outfits' ? (
                          <OutfitPicker config={draft} onChange={setEdits} />
                        ) : (
                          <div className="grid gap-3.5">
                            {active !== 'face' && (
                              <StylePicker part={active} config={draft} onChange={(id) => setStyle(active, id)} />
                            )}
                            {COLORS[active].map((part) =>
                              part === 'beard' && stylesFor(draft.styles).beard === 'clean-shaven' ? null : (
                                <Swatches
                                  key={part}
                                  part={part}
                                  value={draft.colors[part] ?? MATCH_HAIR}
                                  onChange={(id) => setPart(part, id)}
                                />
                              ),
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
                </section>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    className="lu-link-button inline-flex items-center gap-1.5"
                    onClick={() => setEdits(randomAvatar())}
                    data-testid="character-random"
                  >
                    <IonIcon icon={shuffleOutline} aria-hidden="true" />
                    {t('avatar.randomize')}
                  </button>
                  <button
                    type="button"
                    className="lu-link-button inline-flex items-center gap-1.5"
                    onClick={() => setEdits(null)}
                    disabled={!dirty}
                    data-testid="character-reset"
                  >
                    <IonIcon icon={refreshOutline} aria-hidden="true" />
                    {t('avatar.reset')}
                  </button>
                </div>

                <CtaButton
                  className="w-full"
                  onClick={() => void save()}
                  disabled={saving}
                  aria-busy={saving}
                  data-testid="character-save"
                >
                  {saving ? t('avatar.saving') : t('avatar.save')}
                </CtaButton>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      <PixelDialog
        open={confirmLeave}
        title={t('avatar.leaveTitle')}
        cancelLabel={t('avatar.keepEditing')}
        confirmLabel={t('avatar.discard')}
        destructive
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          setEdits(null);
          leave();
        }}
      />
      <PixelToast message={failed ? t('avatar.saveFailed') : null} onDone={clearFailed} />
    </IonPage>
  );
};

export default Character;
