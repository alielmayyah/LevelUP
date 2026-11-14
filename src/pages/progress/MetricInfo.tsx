import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import PixelIcon, { type PixelIconName } from '../../components/PixelIcon';

export interface InfoTopic {
  key: string;
  icon: PixelIconName;
  tone: string;
  /** The member's value for this measurement in the scan on screen, already formatted ("47.5 kg"). */
  value?: string;
}

/** The small ⓘ button on a measurement. 44px to tap, drawn small so it doesn't crowd the number. */
export const InfoButton: React.FC<{ label: string; onClick: () => void; testId: string; className?: string }> = ({
  label,
  onClick,
  testId,
  className = '',
}) => (
  <button
    type="button"
    className={`lu-info-button grid size-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-[1.15rem] text-muted ${className}`}
    aria-label={label}
    onClick={onClick}
    data-testid={testId}
  >
    <PixelIcon name="info" />
  </button>
);

const PARTS = [
  { part: 'what', icon: 'bulb' },
  { part: 'why', icon: 'heart' },
  { part: 'tip', icon: 'checkCircle' },
] as const;

interface Props {
  topic: InfoTopic | null;
  onClose: () => void;
}

/**
 * Explains one measurement: the member's own value up top, then what it is,
 * why it matters, and what to do, as three short rows. Opens as a bottom sheet
 * on the native <dialog> (focus trap, Escape, backdrop tap, Android back), so
 * no Ionic overlay lands in the bundle. The ✕ is the visible way out.
 */
const MetricInfo: React.FC<Props> = ({ topic, onClose }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const open = topic !== null;

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
      className="lu-info-sheet m-0 mx-auto mt-auto w-full max-w-[480px] border-0 bg-transparent p-0 text-ink backdrop:bg-pixel-ink/55"
      aria-labelledby={titleId}
      data-testid="metric-info"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {topic && (
        <div
          className={`lu-info-panel grid max-h-[85dvh] gap-4 overflow-y-auto bg-surface px-5 pt-5 pb-[calc(20px+var(--ion-safe-area-bottom,0px))] ar:font-arabic ${topic.tone}`}
        >
          <header className="flex items-start gap-3.5">
            <span className="lu-info-icon grid size-14 flex-none place-items-center">
              <PixelIcon className="text-[2rem]" name={topic.icon} />
            </span>
            <div className="grid min-w-0 flex-1 gap-1">
              <h2 id={titleId} className="lu-display m-0 text-[1.9rem] leading-none text-ink">
                {t(`progress.metric.${topic.key}`)}
              </h2>
              {topic.value && (
                <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-[0.85rem] font-semibold text-muted">
                  <strong className="lu-display text-[1.6rem] font-normal text-ink" data-testid="metric-info-value">
                    {topic.value}
                  </strong>
                  {t('progress.infoYours')}
                </p>
              )}
            </div>
            <button
              type="button"
              className="lu-icon-button -me-1"
              aria-label={t('progress.closeScans')}
              onClick={onClose}
            >
              <PixelIcon name="close" />
            </button>
          </header>

          <ul className="m-0 grid list-none gap-2.5 p-0">
            {PARTS.map(({ part, icon }) => (
              <li key={part} className="lu-info-row flex items-start gap-3 rounded-[10px] p-3">
                <span className="lu-info-row-icon grid size-9 flex-none place-items-center rounded-lg text-[1.15rem]">
                  <PixelIcon name={icon} />
                </span>
                <div className="grid min-w-0 gap-0.5">
                  <h3 className="m-0 text-[0.9rem] font-extrabold text-ink">{t(`progress.infoHead.${part}`)}</h3>
                  <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
                    {t(`progress.info.${topic.key}.${part}`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </dialog>
  );
};

export default MetricInfo;
