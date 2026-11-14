import { IonContent, IonIcon, IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { arrowBack, checkmark, diceOutline, refreshOutline } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveAvatar } from '../api/avatar';
import type { AvatarConfigDto, ProfileDto } from '../api/types';
import { useApi } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import {
  CUSTOMIZER_TABS,
  MATCH_HAIR,
  colorIdFor,
  showsLowerLeg,
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
import PixelToast from '../components/PixelToast';
import ScrollStrip from '../components/ScrollStrip';
import { useSwipe } from '../components/useSwipe';
import { focusSibling, rovingTarget } from '../components/roving';
import '../avatar/avatar.scss';

const COLORS: Record<Exclude<CustomizerTab, 'outfits'>, readonly ColorPart[]> = {
  hair: ['hair'],
  body: ['skin'],
  top: ['tank'],
  pants: ['shorts'],
  shoes: ['shoes'],
  socks: ['socks'],
  beard: ['beard'],
  face: ['eyes'],
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
    <div className="grid min-w-0 gap-1.5" data-testid={`part-${part}`}>
      <p
        id={labelId}
        className="m-0 flex items-baseline gap-x-2 text-[0.78rem] font-extrabold text-muted uppercase ar:normal-case"
      >
        {t(`avatar.part.${part}`)}
        <span className="font-semibold normal-case" aria-hidden="true">
          {t(`avatar.color.${value}`)}
        </span>
      </p>
      {/* One row that scrolls sideways, edge to edge, like a color strip in a camera app. */}
      <ScrollStrip
        role="radiogroup"
        aria-labelledby={labelId}
        outerClassName="-mx-3"
        className="flex gap-2.5 overflow-x-auto px-3 pt-1 pb-2"
      >
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
              className="lu-swatch relative grid size-11 flex-none cursor-pointer place-items-center rounded-full border-2 border-line bg-surface-2 p-0 text-ink"
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
      </ScrollStrip>
    </div>
  );
};

/** How long after the last change the character saves, so tapping through colors sends one request. */
const AUTOSAVE_MS = 500;

/**
 * A full-screen editor in the style of camera-app avatar makers: the character
 * stays pinned on top while a panel below switches categories. Every change
 * saves on its own (no Save button); leaving with a save still pending sends
 * it right away. The tab bar is hidden here (see TabBar).
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
  /** Edits not yet saved; null means the draft is the saved character. */
  const [edits, setEdits] = useState<AvatarConfigDto | null>(null);
  const [active, setActive] = useState<CustomizerTab>('outfits');
  useIonViewWillEnter(() => setActive('outfits'));
  const draft = edits ?? saved;
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [failed, setFailed] = useState(false);
  const clearFailed = useCallback(() => setFailed(false), []);
  /** The look when the editor opened, for Reset. */
  const [original, setOriginal] = useState<AvatarConfigDto | null>(null);
  if (saved && !original) setOriginal(saved);

  const dirty = !!draft && !!saved && !sameAvatar(draft, saved);

  /** Saves the current edits; keeps them if the save fails so the next change retries. */
  const latest = useRef<AvatarConfigDto | null>(null);
  useEffect(() => {
    latest.current = dirty ? draft : null;
  }, [dirty, draft]);
  const { setData } = me;
  const flush = useCallback(async () => {
    const look = latest.current;
    if (!look) return;
    setStatus('saving');
    try {
      const result = await saveAvatar(look);
      setData((d) => ({ ...d, avatar: result }));
      // Only clear the edits if nothing changed while the request ran.
      setEdits((current) => (current && sameAvatar(current, look) ? null : current));
      setStatus('saved');
    } catch {
      setFailed(true);
      setStatus('idle');
    }
  }, [setData]);

  // Each change saves a moment after the last tap.
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => void flush(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [draft, dirty, flush]);

  const leave = useCallback(() => {
    // A change made in the last half second still gets saved.
    void flush();
    if (router.canGoBack()) router.goBack();
    else router.push('/tabs/profile', 'back', 'replace');
  }, [flush, router]);

  const setPart = (part: ColorPart, id: string) => {
    if (draft) setEdits({ ...draft, colors: { ...draft.colors, [part]: id } });
  };

  const setStyle = <K extends StylePart>(part: K, id: ResolvedStyles[K]) => {
    if (draft) setEdits({ ...draft, styles: { ...stylesFor(draft.styles), [part]: id } });
  };

  const styles = draft ? stylesFor(draft.styles) : null;

  // Swipe sideways on the options to move to the next or previous category; the category row follows.
  const nextTab = useCallback(
    () =>
      setActive(
        (cur) => CUSTOMIZER_TABS[Math.min(CUSTOMIZER_TABS.length - 1, CUSTOMIZER_TABS.indexOf(cur) + 1)] ?? cur,
      ),
    [],
  );
  const prevTab = useCallback(
    () => setActive((cur) => CUSTOMIZER_TABS[Math.max(0, CUSTOMIZER_TABS.indexOf(cur) - 1)] ?? cur),
    [],
  );
  const swipe = useSwipe({ onNext: nextTab, onPrev: prevTab, rtl: i18n.dir() === 'rtl' });
  useEffect(() => {
    document.getElementById(`avatar-tab-${active}`)?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' });
  }, [active]);

  return (
    <IonPage data-testid="page-character">
      {/* The page holds still; only the option panel scrolls, so the character never leaves the screen. */}
      <IonContent scrollY={false}>
        <div className="lu-editor grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_minmax(0,1fr)] split:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] split:grid-rows-[auto_minmax(0,1fr)]">
          <div className="flex items-center gap-2 px-(--lu-gutter) pt-[calc(10px+var(--ion-safe-area-top,0px))] pb-2 split:col-span-2">
            <button
              type="button"
              className="lu-icon-button"
              onClick={leave}
              aria-label={t('avatar.back')}
              data-testid="character-back"
            >
              <IonIcon className="rtl:-scale-x-100" icon={arrowBack} aria-hidden="true" />
            </button>
            <h1 className="lu-display m-0 min-w-0 flex-1 truncate text-center text-[1.75rem] leading-none text-ink">
              {t('avatar.title')}
            </h1>
            <button
              type="button"
              className="lu-icon-button"
              onClick={() => setEdits(randomAvatar())}
              disabled={!draft}
              aria-label={t('avatar.randomize')}
              data-testid="character-random"
            >
              <IonIcon icon={diceOutline} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="lu-icon-button disabled:opacity-40"
              onClick={() => original && setEdits(original)}
              disabled={!draft || !original || sameAvatar(draft, original)}
              aria-label={t('avatar.reset')}
              data-testid="character-reset"
            >
              <IonIcon icon={refreshOutline} aria-hidden="true" />
            </button>
          </div>

          {me.status === 'loading' && (
            <div className="px-(--lu-gutter) split:col-span-2" aria-busy="true">
              <div className="lu-skeleton-card min-h-60" />
            </div>
          )}

          {me.status === 'error' && (
            <div className="lu-state split:col-span-2" role="alert">
              <p>{t('avatar.error')}</p>
              <CtaButton onClick={() => void me.retry()}>{t('common.retry')}</CtaButton>
            </div>
          )}

          {draft && styles && (
            <>
              {/* The stage: the character, big, on the dusk backdrop with a floor shadow. */}
              <section
                className="lu-avatar-stage relative grid place-items-center pt-2 pb-4"
                aria-label={t('avatar.preview')}
              >
                <Avatar
                  config={draft}
                  crop="full"
                  label={t('avatar.preview')}
                  testId="character-preview"
                  className="relative z-1 block h-[clamp(170px,32vh,320px)] w-auto max-w-full short-landscape:h-[56vh] split:h-[min(62vh,480px)]"
                />
                <span className="lu-stage-floor" aria-hidden="true" />
                <p
                  className="lu-save-chip absolute inset-e-3 bottom-2 m-0 min-h-[1.2em] rounded-full px-2.5 py-0.5 text-[0.75rem] font-extrabold empty:hidden"
                  role="status"
                  data-testid="character-status"
                >
                  {status === 'saving' ? t('avatar.saving') : status === 'saved' ? t('avatar.saved') : ''}
                </p>
              </section>

              {/* The panel: one row of categories, then that category's colors and styles. */}
              <section
                className="lu-editor-panel flex min-h-0 flex-col split:m-3 split:ms-0"
                aria-label={t('avatar.customize')}
              >
                <ScrollStrip
                  role="tablist"
                  aria-label={t('avatar.customize')}
                  outerClassName="flex-none"
                  className="flex gap-1.5 overflow-x-auto px-3 pt-3 pb-2"
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
                      className="lu-customizer-tab grid min-h-14 min-w-16 flex-none cursor-pointer place-items-center content-center gap-1 rounded-xl border-0 px-2 py-1.5 text-[0.72rem] leading-tight font-extrabold whitespace-nowrap"
                      onClick={(e) => {
                        setActive(tab);
                        // Bring a half-hidden category fully into the strip.
                        e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' });
                      }}
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
                </ScrollStrip>

                <div
                  ref={swipe}
                  className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-[calc(16px+var(--ion-safe-area-bottom,0px))]"
                >
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
                          <div className="grid gap-3">
                            {/* Colors first, then shapes: the strip is what people change most. */}
                            {COLORS[active].map((part) =>
                              (part === 'beard' && styles.beard === 'clean-shaven') ||
                              (part === 'shoes' && styles.shoes === 'barefoot') ? null : (
                                <Swatches
                                  key={part}
                                  part={part}
                                  value={colorIdFor(draft, part)}
                                  onChange={(id) => setPart(part, id)}
                                />
                              ),
                            )}
                            {active === 'socks' && !showsLowerLeg(styles.pants) && (
                              <p className="m-0 text-[0.8rem] text-muted">{t('avatar.socksHint')}</p>
                            )}
                            {active !== 'face' && (
                              <StylePicker part={active} config={draft} onChange={(id) => setStyle(active, id)} />
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </IonContent>

      <PixelToast message={failed ? t('avatar.saveFailed') : null} onDone={clearFailed} />
    </IonPage>
  );
};

export default Character;
