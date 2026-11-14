import { IonIcon, IonModal } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import type { AssessmentDto } from '../../api/types';
import PixelIcon, { type PixelIconName } from '../../components/PixelIcon';
import { formatNumber, numberLocale } from '../../i18n/format';

interface Props {
  open: boolean;
  /** Newest first, as the API returns them. */
  scans: AssessmentDto[];
  /** Index of the scan shown on the page. */
  current: number;
  onPick: (index: number) => void;
  onClose: () => void;
}

const fullDate = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(iso),
  );

const STATS: { key: string; icon: PixelIconName; tone: string; value: (a: AssessmentDto) => string }[] = [
  { key: 'weight', icon: 'scale', tone: 'lu-tone-weight', value: (a) => formatNumber(a.weightKg, 1) },
  { key: 'muscle', icon: 'muscle', tone: 'lu-tone-muscle', value: (a) => formatNumber(a.skeletalMuscleKg, 1) },
  { key: 'bodyFat', icon: 'flame', tone: 'lu-tone-fat', value: (a) => `${formatNumber(a.bodyFatPct, 1)}%` },
];

/** Every scan in one list, newest first. Tapping one shows it on the Progress page. */
const ScanHistory: React.FC<Props> = ({ open, scans, current, onPick, onClose }) => {
  const { t } = useTranslation();
  const kg = t('units.kg');
  return (
    <IonModal
      // Name Ionic's inner role="dialog" directly (WCAG 4.1.2), as the notifications sheet does.
      onWillPresent={(e) =>
        (e.target as HTMLElement).shadowRoot
          ?.querySelector('[role="dialog"]')
          ?.setAttribute('aria-label', t('progress.allScans'))
      }
      isOpen={open}
      onDidDismiss={onClose}
      // Full height, so every scan can be scrolled to on a short phone; swipe down to close.
      initialBreakpoint={1}
      breakpoints={[0, 1]}
    >
      {open && (
        <section
          className="flex h-full flex-col bg-page text-ink"
          data-testid="scan-history"
          aria-labelledby="scans-title"
        >
          <div className="flex items-center gap-2 px-4 pt-[18px] pb-3">
            <h2 id="scans-title" className="lu-display m-0 flex-1 text-[2.1rem] leading-none">
              {t('progress.allScans')}
            </h2>
            <button type="button" className="lu-icon-button" aria-label={t('progress.closeScans')} onClick={onClose}>
              <IonIcon icon={close} aria-hidden="true" />
            </button>
          </div>
          <ol className="m-0 grid list-none gap-2 overflow-y-auto px-4 pt-0 pb-[calc(16px+var(--ion-safe-area-bottom,0px))]">
            {scans.map((s, i) => {
              const on = i === current;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-current={on ? 'true' : undefined}
                    className={`lu-scan-row grid w-full cursor-pointer gap-2 rounded-[10px] border-2 bg-surface p-3 text-start font-inherit text-ink ${on ? 'is-current border-primary' : 'border-line'}`}
                    onClick={() => {
                      onPick(i);
                      onClose();
                    }}
                    data-testid="scan-row"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="font-extrabold">{fullDate(s.takenAt)}</strong>
                      {i === 0 && <span className="lu-chip lu-chip-primary">{t('progress.newest')}</span>}
                      {on && <span className="lu-chip">{t('progress.showing')}</span>}
                      <span className="ms-auto text-[0.78rem] font-bold text-muted">
                        {t('progress.scanNumber', { n: formatNumber(scans.length - i) })}
                      </span>
                    </span>
                    <span className="grid grid-cols-3 gap-2">
                      {STATS.map((st) => (
                        <span key={st.key} className={`flex items-center gap-1.5 ${st.tone}`}>
                          <PixelIcon className="flex-none text-[1.1rem]" name={st.icon} />
                          <span className="grid leading-tight">
                            <span className="text-[0.7rem] font-bold text-muted">{t(`progress.metric.${st.key}`)}</span>
                            <span className="lu-display text-[1.15rem] whitespace-nowrap">
                              {st.value(s)}
                              {st.key !== 'bodyFat' && <span className="text-[0.7em]"> {kg}</span>}
                            </span>
                          </span>
                        </span>
                      ))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </IonModal>
  );
};

export default ScanHistory;
