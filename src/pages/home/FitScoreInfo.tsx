import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { FitScoreTier } from '../../api/types';
import Icon from '../../components/Icon';
import { TIERS, tierKey, tierRangeKey } from './homeText';

interface Props {
  open: boolean;
  /** The member's tier, marked in the list; null before the first scan. */
  tier: FitScoreTier | null;
  onClose: () => void;
}

/**
 * Explains FitScore in plain words: what it is, the five tiers with their
 * ranges, one tip to raise it, and who can see it. A bottom sheet on the native
 * <dialog> (focus trap, Escape, backdrop tap, Android back), like Progress's
 * MetricInfo, so no Ionic overlay lands in the bundle.
 */
const FitScoreInfo: React.FC<Props> = ({ open, tier, onClose }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onBack = (e: Event) =>
      (e as CustomEvent<{ register: (priority: number, handler: () => void) => void }>).detail.register(150, onClose);
    document.addEventListener('ionBackButton', onBack);
    return () => document.removeEventListener('ionBackButton', onBack);
  }, [open, onClose]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="lu-fs-sheet m-0 mx-auto mt-auto w-full max-w-[480px] border-0 bg-transparent p-0 text-ink backdrop:bg-scrim/55"
      aria-labelledby={titleId}
      data-testid="fitscore-info"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="lu-fs-panel grid max-h-[85dvh] gap-4 overflow-y-auto bg-surface px-5 pt-5 pb-[calc(20px+var(--ion-safe-area-bottom,0px))] ar:font-arabic">
          <header className="flex items-start gap-3">
            <h2 id={titleId} className="m-0 flex-1 pt-2 text-[1.375rem] leading-tight font-bold text-ink">
              {t('home.fitScoreInfo.title')}
            </h2>
            <button
              type="button"
              className="lu-icon-button -me-1"
              aria-label={t('home.fitScoreInfo.close')}
              onClick={onClose}
            >
              <Icon name="close" />
            </button>
          </header>

          <p className="m-0 text-[1rem] leading-relaxed text-ink">{t('home.fitScoreInfo.what')}</p>

          <section className="grid gap-2" aria-labelledby={`${titleId}-tiers`}>
            <h3 id={`${titleId}-tiers`} className="m-0 text-[1rem] font-semibold text-ink">
              {t('home.fitScoreInfo.tiersTitle')}
            </h3>
            {/* Highest first, the way members read a scale. */}
            <ul className="m-0 grid list-none gap-1.5 p-0" data-testid="fitscore-tiers">
              {[...TIERS].reverse().map((name) => {
                const current = name === tier;
                return (
                  <li
                    key={name}
                    className={`lu-fs-tier lu-tier-${TIERS.indexOf(name) + 1} flex items-center gap-3 rounded-[10px] px-3 py-2.5 ${current ? 'is-current' : ''}`}
                    aria-current={current ? 'true' : undefined}
                  >
                    <span className="lu-fs-tier-dot size-3 flex-none rounded-full" aria-hidden="true" />
                    <span className="flex-1 font-semibold text-ink">{t(tierKey(name))}</span>
                    {current && (
                      <span className="text-[0.875rem] font-semibold text-ink">{t('home.fitScoreInfo.you')}</span>
                    )}
                    <span className="text-[0.875rem] font-normal text-muted">{t(tierRangeKey(name))}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="grid gap-1" aria-labelledby={`${titleId}-tip`}>
            <h3 id={`${titleId}-tip`} className="m-0 text-[1rem] font-semibold text-ink">
              {t('home.fitScoreInfo.tipTitle')}
            </h3>
            <p className="m-0 leading-relaxed font-normal text-muted">{t('home.fitScoreInfo.tip')}</p>
          </section>

          <p className="m-0 flex items-center gap-2 font-normal text-muted">
            <Icon name="lock" />
            {t('home.fitScoreInfo.privacy')}
          </p>
        </div>
      )}
    </dialog>
  );
};

export default FitScoreInfo;
