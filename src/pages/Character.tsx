import { IonContent, IonPage, useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveAvatar } from '../api/avatar';
import type { AvatarConfigDto, AvatarPortraitDto, ProfileDto } from '../api/types';
import { useApi } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import {
  DEFAULT_HIJAB_COLOR,
  memberAvatar,
  PORTRAIT_EYES,
  PORTRAIT_LOOKS,
  PORTRAIT_OUTFITS,
  portraitOf,
  presetsFor,
  sameAvatar,
} from '../avatar/catalog';
import CtaButton from '../components/CtaButton';
import Icon, { type IconName } from '../components/Icon';
import { focusSibling, rovingTarget } from '../components/roving';
import { useSwipe } from '../components/useSwipe';
import '../avatar/avatar.scss';

const TABS = ['skin', 'hair', 'eyes', 'outfit'] as const;
type PortraitPart = (typeof TABS)[number];
const TAB_ICONS: Record<PortraitPart, IconName> = {
  skin: 'smile',
  hair: 'hair',
  eyes: 'eye',
  outfit: 'shirt',
};
const EYE_COLORS = Object.entries(PORTRAIT_EYES).map(([id, swatch]) => ({
  id: id as AvatarPortraitDto['eyes'],
  swatch,
}));

interface SwatchesProps<T extends string> {
  field: string;
  label: string;
  choices: readonly { id: T; swatch: string }[];
  value: T;
  onChange: (id: T) => void;
}

/** One part's colors: a radio group with one Tab stop and arrow keys, each swatch named by its color. */
function Swatches<T extends string>({ field, label, choices, value, onChange }: SwatchesProps<T>) {
  const { t, i18n } = useTranslation();
  const labelId = `swatch-${field}`;
  const colorLabel = (id: string) => t(`avatar.color.${id}`);
  return (
    <div className="grid min-w-0 gap-2" data-testid={`part-${field}`}>
      <p id={labelId} className="m-0 flex items-baseline gap-x-2 text-[0.8rem] font-semibold text-muted">
        {label}
        <span className="font-semibold text-ink" aria-hidden="true">
          {colorLabel(value)}
        </span>
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-1.5 min-[360px]:gap-3">
        {choices.map((preset, i) => {
          const on = preset.id === value;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={colorLabel(preset.id)}
              tabIndex={on ? 0 : -1}
              className="lu-swatch relative grid size-11 flex-none cursor-pointer place-items-center rounded-full border border-line p-0 min-[360px]:size-12"
              style={{ backgroundColor: preset.swatch }}
              onClick={() => onChange(preset.id)}
              onKeyDown={(e) => {
                const to = rovingTarget(e, i, choices.length, i18n.dir() === 'rtl');
                if (to === null) return;
                onChange(choices[to].id);
                focusSibling(e, to);
              }}
            >
              {on && <Icon className="lu-swatch-check text-[1.1rem]" name="check" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Styles<T extends string>({
  label,
  choices,
  value,
  labelFor,
  onChange,
}: {
  label: string;
  choices: readonly T[];
  value: T;
  labelFor?: (choice: T) => string;
  onChange: (value: T) => void;
}) {
  const { t, i18n } = useTranslation();
  const styleLabel = (id: string) => t(`avatar.style.${id}`);
  return (
    <div className="grid gap-2">
      <p className="m-0 text-[0.8rem] font-semibold text-muted">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {choices.map((choice, i) => (
          <button
            key={choice}
            type="button"
            role="radio"
            aria-checked={choice === value}
            tabIndex={choice === value ? 0 : -1}
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-surface px-3 text-[0.8rem] font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-contrast"
            onClick={() => onChange(choice)}
            onKeyDown={(e) => {
              const target = rovingTarget(e, i, choices.length, i18n.dir() === 'rtl');
              if (target === null) return;
              onChange(choices[target]);
              focusSibling(e, target);
            }}
          >
            {labelFor ? labelFor(choice) : styleLabel(choice)}
          </button>
        ))}
      </div>
    </div>
  );
}

function another<T>(choices: readonly T[], current: T): T {
  const others = choices.filter((choice) => choice !== current);
  return others[Math.floor(Math.random() * others.length)];
}

/** How long after the last change the character saves, so tapping through colors sends one request. */
const AUTOSAVE_MS = 500;

/**
 * The avatar editor: the portrait stays pinned on top while a panel below
 * switches between parts, each a row of color swatches. Every change saves on
 * its own (no Save button); leaving with a save still pending sends it right
 * away. The tab bar is hidden here (see TabBar).
 */
const Character: React.FC = () => {
  const { t, i18n } = useTranslation();
  const router = useIonRouter();
  const me = useApi<ProfileDto>('/me');
  const p = me.status === 'ready' ? me.data : null;
  const memberId = p?.memberId;
  const sex = p?.sex ?? 'MALE';
  const looks = PORTRAIT_LOOKS[sex];

  /** What the member has now: their saved character, or their starter. */
  const saved = useMemo(() => (p ? memberAvatar(p) : null), [p]);
  /** Edits not yet saved; null means the draft is the saved character. */
  const [edits, setEdits] = useState<AvatarConfigDto | null>(null);
  const [active, setActive] = useState<PortraitPart>('skin');
  const draft = edits ?? saved;
  const portrait = draft && portraitOf(draft, sex);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [failed, setFailed] = useState(false);
  const optionsPanel = useRef<HTMLDivElement | null>(null);
  const leaving = useRef(false);
  /** The look when the editor opened, for Reset. */
  const [original, setOriginal] = useState<AvatarConfigDto | null>(null);
  if (saved && !original) setOriginal(saved);
  useIonViewWillEnter(() => {
    leaving.current = false;
    if (optionsPanel.current) optionsPanel.current.scrollTop = 0;
    setActive('skin');
    setOriginal(null);
  }, []);

  const pending = useRef<AvatarConfigDto | null>(null);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const { setData } = me;
  const flush = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    if (memberId === undefined || !pending.current) return Promise.resolve(true);
    setStatus('saving');
    setFailed(false);
    const savePending = async () => {
      try {
        // Finish the current write before sending the latest edit, including an undo.
        while (pending.current) {
          const look = pending.current;
          const result = await saveAvatar(memberId, look);
          setData((d) => ({ ...d, avatar: result }));
          if (pending.current && sameAvatar(pending.current, look)) {
            pending.current = null;
            setEdits(null);
          }
        }
        setStatus('saved');
        return true;
      } catch {
        setFailed(true);
        setStatus('idle');
        return false;
      } finally {
        inFlight.current = null;
      }
    };
    inFlight.current = savePending();
    return inFlight.current;
  }, [memberId, setData]);

  const edit = (look: AvatarConfigDto) => {
    pending.current = !inFlight.current && saved && sameAvatar(look, saved) ? null : look;
    setEdits(pending.current);
    if (!inFlight.current) setStatus('idle');
    setFailed(false);
  };

  const discardUnsaved = () => {
    pending.current = null;
    setEdits(null);
    setFailed(false);
  };

  // Each change saves a moment after the last tap.
  useEffect(() => {
    if (!edits) return;
    const timer = setTimeout(() => void flush(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [edits, flush]);

  useIonViewWillLeave(() => void flush(), [flush]);
  const leave = useCallback(async () => {
    if (leaving.current) return;
    leaving.current = true;
    if (!(await flush())) {
      leaving.current = false;
      return;
    }
    if (router.canGoBack()) router.goBack();
    else router.push('/tabs/profile', 'back', 'replace');
  }, [flush, router]);

  const setPart = (part: 'skin' | 'hair' | 'top', id: string) => {
    if (draft) edit({ ...draft, colors: { ...draft.colors, [part]: id } });
  };

  function setPortrait<K extends keyof AvatarPortraitDto>(key: K, value: AvatarPortraitDto[K]) {
    if (draft && portrait) edit({ ...draft, portrait: { ...portrait, [key]: value } });
  }

  const randomize = () => {
    if (!draft || !portrait) return;
    const colors = { ...draft.colors };
    for (const part of ['skin', 'hair', 'top'] as const) {
      colors[part] = another(
        presetsFor(part).map((preset) => preset.id),
        colors[part],
      );
    }
    const look = another(looks, portrait.look);
    edit({
      ...draft,
      colors,
      portrait: {
        ...portrait,
        look,
        outfit: another(PORTRAIT_OUTFITS, portrait.outfit),
        eyes: another(
          EYE_COLORS.map(({ id }) => id),
          portrait.eyes,
        ),
        ...(look === 'hijab' && {
          hijabColor: another(
            presetsFor('top').map(({ id }) => id),
            portrait.hijabColor ?? DEFAULT_HIJAB_COLOR,
          ),
        }),
      },
    });
  };

  const nextTab = useCallback(() => setActive((tab) => TABS[Math.min(TABS.length - 1, TABS.indexOf(tab) + 1)]), []);
  const prevTab = useCallback(() => setActive((tab) => TABS[Math.max(0, TABS.indexOf(tab) - 1)]), []);
  const swipe = useSwipe({ onNext: nextTab, onPrev: prevTab, rtl: i18n.dir() === 'rtl' });
  const setOptionsPanel = useCallback(
    (element: HTMLDivElement | null) => {
      optionsPanel.current = element;
      swipe(element);
    },
    [swipe],
  );
  useEffect(() => {
    if (optionsPanel.current) optionsPanel.current.scrollTop = 0;
  }, [active]);

  return (
    <IonPage data-testid="page-character">
      {/* The page holds still; only the option panel scrolls, so the character never leaves the screen. */}
      <IonContent scrollY={false}>
        <div className="lu-editor grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_minmax(0,1fr)] px-[max(var(--ion-safe-area-left,0px),var(--ion-safe-area-right,0px))] short-landscape:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] short-landscape:grid-rows-[auto_minmax(0,1fr)] split:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] split:grid-rows-[auto_minmax(0,1fr)]">
          <div className="flex items-center gap-2 px-(--lu-gutter) pt-[calc(10px+var(--ion-safe-area-top,0px))] pb-2 short-landscape:col-span-2 split:col-span-2">
            <button
              type="button"
              className="lu-icon-button"
              onClick={leave}
              aria-label={t('avatar.back')}
              data-testid="character-back"
            >
              <Icon className="rtl:-scale-x-100" name="arrowBack" />
            </button>
            <h1 className="lu-display m-0 min-w-0 flex-1 text-center text-[clamp(1.0625rem,4.8vw,1.5rem)] leading-[1.1] wrap-anywhere text-ink">
              {t('avatar.title')}
            </h1>
            <button
              type="button"
              className="lu-icon-button"
              onClick={randomize}
              disabled={!draft}
              aria-label={t('avatar.randomize')}
              data-testid="character-random"
            >
              <Icon name="dice" />
            </button>
            <button
              type="button"
              className="lu-icon-button disabled:opacity-40"
              onClick={() => original && edit(original)}
              disabled={!draft || !original || sameAvatar(draft, original)}
              aria-label={t('avatar.reset')}
              data-testid="character-reset"
            >
              <Icon name="refresh" />
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

          {draft && portrait && (
            <>
              <section
                className="lu-avatar-stage relative grid place-items-center px-3 pt-3 pb-8"
                aria-label={t('avatar.preview')}
              >
                <div className="lu-avatar-frame aspect-square w-[clamp(9rem,38vh,17rem)] max-w-full overflow-hidden rounded-3xl short-landscape:w-[min(50vh,14rem)] split:w-[min(46vh,18rem)]">
                  <Avatar
                    config={draft}
                    sex={sex}
                    label={t('avatar.preview')}
                    testId="character-preview"
                    className="block size-full"
                  />
                </div>
                <p
                  className="lu-save-chip absolute inset-e-3 bottom-2 m-0 min-h-[1.2em] rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold empty:hidden"
                  role="status"
                  data-testid="character-status"
                >
                  {status === 'saving' ? t('avatar.saving') : status === 'saved' ? t('avatar.saved') : ''}
                </p>
              </section>

              {/* The panel: one row of parts, then that part's colors. */}
              <section
                className="lu-editor-panel flex min-h-0 flex-col short-landscape:m-3 short-landscape:ms-0 split:m-3 split:ms-0 split:mb-[max(12px,var(--ion-safe-area-bottom,0px))]"
                aria-label={t('avatar.customize')}
              >
                {failed && (
                  <div className="flex flex-wrap items-center gap-x-2 px-3 pt-2">
                    <p className="m-0 grow text-[0.8rem] text-ink" role="alert">
                      {t('avatar.saveFailed')}
                    </p>
                    <button className="lu-link-button min-h-11 shrink-0" type="button" onClick={() => void flush()}>
                      {t('common.retry')}
                    </button>
                    <button className="lu-link-button min-h-11 shrink-0" type="button" onClick={discardUnsaved}>
                      {t('avatar.discardUnsaved')}
                    </button>
                  </div>
                )}
                <div
                  role="tablist"
                  aria-label={t('avatar.customize')}
                  className="grid shrink-0 grid-cols-4 gap-1 px-3 pt-3 pb-2"
                >
                  {TABS.map((tab, i) => (
                    <button
                      key={tab}
                      id={`avatar-tab-${tab}`}
                      type="button"
                      role="tab"
                      aria-controls={`avatar-panel-${tab}`}
                      aria-selected={tab === active}
                      tabIndex={tab === active ? 0 : -1}
                      className="lu-customizer-tab flex min-h-12 min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border-0 px-1 py-1.5 text-[0.75rem] leading-tight font-semibold"
                      onClick={() => setActive(tab)}
                      onKeyDown={(e) => {
                        const to = rovingTarget(e, i, TABS.length, i18n.dir() === 'rtl');
                        if (to === null) return;
                        setActive(TABS[to]);
                        focusSibling(e, to);
                      }}
                    >
                      <Icon className="text-lg" name={TAB_ICONS[tab]} />
                      {t(`avatar.tab.${tab}`)}
                    </button>
                  ))}
                </div>

                <div
                  ref={setOptionsPanel}
                  data-testid="character-options"
                  className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-[calc(16px+var(--ion-safe-area-bottom,0px))]"
                >
                  {TABS.map((tab) => (
                    <div
                      key={tab}
                      id={`avatar-panel-${tab}`}
                      role="tabpanel"
                      aria-labelledby={`avatar-tab-${tab}`}
                      hidden={tab !== active}
                    >
                      {tab === active && (
                        <div className="grid gap-4">
                          {tab === 'skin' && (
                            <Swatches
                              field="skin"
                              label={t('avatar.tab.skin')}
                              choices={presetsFor('skin')}
                              value={draft.colors.skin}
                              onChange={(id) => setPart('skin', id)}
                            />
                          )}
                          {tab === 'hair' && (
                            <>
                              <Styles
                                label={t(sex === 'FEMALE' ? 'avatar.hairstyle' : 'avatar.look')}
                                choices={looks}
                                value={portrait.look}
                                labelFor={(look) =>
                                  t(`avatar.style.${sex === 'FEMALE' && look === 'curls' ? 'looseCurls' : look}`)
                                }
                                onChange={(look) => setPortrait('look', look)}
                              />
                              {portrait.look === 'hijab' ? (
                                <Swatches
                                  field="hijab"
                                  label={t('avatar.hijabColor')}
                                  choices={presetsFor('top')}
                                  value={portrait.hijabColor ?? DEFAULT_HIJAB_COLOR}
                                  onChange={(id) => setPortrait('hijabColor', id)}
                                />
                              ) : (
                                <Swatches
                                  field="hair"
                                  label={t('avatar.hairColor')}
                                  choices={presetsFor('hair')}
                                  value={draft.colors.hair}
                                  onChange={(id) => setPart('hair', id)}
                                />
                              )}
                            </>
                          )}
                          {tab === 'eyes' && (
                            <Swatches
                              field="eyes"
                              label={t('avatar.tab.eyes')}
                              choices={EYE_COLORS}
                              value={portrait.eyes}
                              onChange={(eyes) => setPortrait('eyes', eyes)}
                            />
                          )}
                          {tab === 'outfit' && (
                            <>
                              <Styles
                                label={t('avatar.outfitStyle')}
                                choices={PORTRAIT_OUTFITS}
                                value={portrait.outfit}
                                onChange={(outfit) => setPortrait('outfit', outfit)}
                              />
                              <Swatches
                                field="top"
                                label={t('avatar.outfitColor')}
                                choices={presetsFor('top')}
                                value={draft.colors.top}
                                onChange={(id) => setPart('top', id)}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Character;
