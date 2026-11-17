import { IonContent, IonPage, useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveAvatar } from '../api/avatar';
import type { AvatarConfigDto, AvatarPart, ProfileDto } from '../api/types';
import { useApi } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import { AVATAR_PARTS, memberAvatar, presetsFor, randomAvatar, sameAvatar } from '../avatar/catalog';
import CtaButton from '../components/CtaButton';
import Icon, { type IconName } from '../components/Icon';
import ScrollStrip from '../components/ScrollStrip';
import { focusSibling, rovingTarget } from '../components/roving';
import { useSwipe } from '../components/useSwipe';
import '../avatar/avatar.scss';

const TAB_ICONS: Record<AvatarPart, IconName> = {
  skin: 'smile',
  hair: 'hair',
  top: 'shirt',
  bottom: 'pants',
  shoes: 'shoe',
};

interface SwatchesProps {
  part: AvatarPart;
  value: string;
  onChange: (id: string) => void;
}

/** One part's colors: a radio group with one Tab stop and arrow keys, each swatch named by its color. */
const Swatches: React.FC<SwatchesProps> = ({ part, value, onChange }) => {
  const { t, i18n } = useTranslation();
  const presets = presetsFor(part);
  const labelId = `swatch-${part}`;
  return (
    <div className="grid min-w-0 gap-2" data-testid={`part-${part}`}>
      <p id={labelId} className="m-0 flex items-baseline gap-x-2 text-[0.8rem] font-semibold text-muted">
        {t(`avatar.tab.${part}`)}
        <span className="font-semibold text-ink" aria-hidden="true">
          {t(`avatar.color.${value}`)}
        </span>
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-3">
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
              className="lu-swatch relative grid size-12 flex-none cursor-pointer place-items-center rounded-full border border-line p-0"
              style={{ backgroundColor: preset.swatch }}
              onClick={() => onChange(preset.id)}
              onKeyDown={(e) => {
                const to = rovingTarget(e, i, presets.length, i18n.dir() === 'rtl');
                if (to === null) return;
                onChange(presets[to].id);
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
};

/** How long after the last change the character saves, so tapping through colors sends one request. */
const AUTOSAVE_MS = 500;

/**
 * The character editor: the figure stays pinned on top while a panel below
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

  /** What the member has now: their saved character, or their starter. */
  const saved = useMemo(() => (p ? memberAvatar(p) : null), [p]);
  /** Edits not yet saved; null means the draft is the saved character. */
  const [edits, setEdits] = useState<AvatarConfigDto | null>(null);
  const [active, setActive] = useState<AvatarPart>('skin');
  const draft = edits ?? saved;
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

  const setPart = (part: AvatarPart, id: string) => {
    if (draft) edit({ ...draft, colors: { ...draft.colors, [part]: id } });
  };

  // Swipe sideways on the options to move to the next or previous part; the part row follows.
  const tabs = AVATAR_PARTS;
  const nextTab = useCallback(
    () => setActive((cur) => tabs[Math.min(tabs.length - 1, tabs.indexOf(cur) + 1)] ?? cur),
    [tabs],
  );
  const prevTab = useCallback(() => setActive((cur) => tabs[Math.max(0, tabs.indexOf(cur) - 1)] ?? cur), [tabs]);
  const swipe = useSwipe({ onNext: nextTab, onPrev: prevTab, rtl: i18n.dir() === 'rtl' });
  const setOptionsPanel = useCallback(
    (element: HTMLDivElement | null) => {
      optionsPanel.current = element;
      swipe(element);
    },
    [swipe],
  );
  useEffect(() => {
    document.getElementById(`avatar-tab-${active}`)?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' });
    if (optionsPanel.current) optionsPanel.current.scrollTop = 0;
  }, [active]);

  return (
    <IonPage data-testid="page-character">
      {/* The page holds still; only the option panel scrolls, so the character never leaves the screen. */}
      <IonContent scrollY={false}>
        <div className="lu-editor grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_minmax(0,1fr)] px-[max(var(--ion-safe-area-left,0px),var(--ion-safe-area-right,0px))] split:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] split:grid-rows-[auto_minmax(0,1fr)]">
          <div className="flex items-center gap-2 px-(--lu-gutter) pt-[calc(10px+var(--ion-safe-area-top,0px))] pb-2 split:col-span-2">
            <button
              type="button"
              className="lu-icon-button"
              onClick={leave}
              aria-label={t('avatar.back')}
              data-testid="character-back"
            >
              <Icon className="rtl:-scale-x-100" name="arrowBack" />
            </button>
            <h1 className="lu-display m-0 min-w-0 flex-1 truncate text-center text-[1.5rem] leading-none text-ink">
              {t('avatar.title')}
            </h1>
            <button
              type="button"
              className="lu-icon-button"
              onClick={() => edit(randomAvatar())}
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

          {draft && (
            <>
              {/* The stage: the character, big, with a soft floor shadow. */}
              <section
                className="lu-avatar-stage relative grid place-items-center pt-2 pb-4"
                aria-label={t('avatar.preview')}
              >
                <div className="relative isolate grid max-w-full place-items-center">
                  <span className="lu-stage-floor" aria-hidden="true" />
                  <Avatar
                    config={draft}
                    crop="full"
                    label={t('avatar.preview')}
                    testId="character-preview"
                    className="relative z-1 block h-[clamp(200px,38vh,380px)] w-auto max-w-full short-landscape:h-[56vh] split:h-[min(66vh,520px)]"
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
                className="lu-editor-panel flex min-h-0 flex-col split:m-3 split:ms-0 split:mb-[max(12px,var(--ion-safe-area-bottom,0px))]"
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
                <ScrollStrip
                  role="tablist"
                  aria-label={t('avatar.customize')}
                  outerClassName="flex-none"
                  className="flex gap-1.5 overflow-x-auto px-3 pt-3 pb-2"
                >
                  {tabs.map((tab, i) => (
                    <button
                      key={tab}
                      id={`avatar-tab-${tab}`}
                      type="button"
                      role="tab"
                      aria-controls={`avatar-panel-${tab}`}
                      aria-selected={tab === active}
                      tabIndex={tab === active ? 0 : -1}
                      className="lu-customizer-tab grid min-h-14 min-w-16 flex-none cursor-pointer scroll-mx-8 place-items-center content-center gap-1 rounded-xl border-0 px-2 py-1.5 text-[0.75rem] leading-tight font-semibold whitespace-nowrap"
                      onClick={(e) => {
                        setActive(tab);
                        // Bring a half-hidden part fully into the strip.
                        e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' });
                      }}
                      onKeyDown={(e) => {
                        const to = rovingTarget(e, i, tabs.length, i18n.dir() === 'rtl');
                        if (to === null) return;
                        setActive(tabs[to]);
                        focusSibling(e, to);
                      }}
                    >
                      <Icon className="text-[1.25rem]" name={TAB_ICONS[tab]} />
                      {t(`avatar.tab.${tab}`)}
                    </button>
                  ))}
                </ScrollStrip>

                <div
                  ref={setOptionsPanel}
                  data-testid="character-options"
                  className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-[calc(16px+var(--ion-safe-area-bottom,0px))]"
                >
                  {tabs.map((tab) => (
                    <div
                      key={tab}
                      id={`avatar-panel-${tab}`}
                      role="tabpanel"
                      aria-labelledby={`avatar-tab-${tab}`}
                      hidden={tab !== active}
                    >
                      {tab === active && (
                        <Swatches part={tab} value={draft.colors[tab]} onChange={(id) => setPart(tab, id)} />
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
