import { IonIcon } from '@ionic/react';
import { close, informationCircleOutline } from 'ionicons/icons';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import CtaButton from '../../components/CtaButton';
import PixelIcon, { type PixelIconName } from '../../components/PixelIcon';

export interface InfoTopic {
  key: string;
  icon: PixelIconName;
  tone: string;
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
    <IonIcon icon={informationCircleOutline} aria-hidden="true" />
  </button>
);

interface Props {
  topic: InfoTopic | null;
  onClose: () => void;
}

/**
 * Explains one measurement in plain words: what it is, why it matters, and
 * what to do. Built on the native <dialog> (focus trap, Escape, backdrop tap,
 * Android back), like PixelDialog, so no Ionic overlay lands in the bundle.
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

  const section = (part: 'what' | 'why' | 'tip') =>
    topic && (
      <section className="grid gap-1">
        <h3 className="m-0 text-[0.78rem] font-extrabold tracking-[0.06em] text-muted uppercase ar:tracking-normal">
          {t(`progress.infoHead.${part}`)}
        </h3>
        <p className="m-0 text-[0.95rem] leading-relaxed text-ink">{t(`progress.info.${topic.key}.${part}`)}</p>
      </section>
    );

  return (
    <dialog
      ref={ref}
      className="w-[min(calc(100%-32px),400px)] border-0 bg-transparent p-0 text-ink backdrop:bg-pixel-ink/55"
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
        <div className="grid max-h-[calc(100dvh-48px)] gap-4 overflow-y-auto rounded-xl border-2 border-line bg-surface p-5 shadow-[0_5px_0_var(--lu-pixel-shadow)] ar:font-arabic">
          <header className="flex items-center gap-2.5">
            <span className={`lu-more-card grid size-11 flex-none place-items-center rounded-lg ${topic.tone}`}>
              <PixelIcon className="text-[1.6rem]" name={topic.icon} />
            </span>
            <h2 id={titleId} className="lu-display m-0 flex-1 text-[1.8rem] leading-none">
              {t(`progress.metric.${topic.key}`)}
            </h2>
            <button type="button" className="lu-icon-button" aria-label={t('progress.closeScans')} onClick={onClose}>
              <IonIcon icon={close} aria-hidden="true" />
            </button>
          </header>
          {section('what')}
          {section('why')}
          {section('tip')}
          <p className="m-0 rounded-lg bg-surface-2 px-3 py-2 text-[0.8rem] font-semibold text-muted">
            {t('progress.infoCoach')}
          </p>
          <CtaButton className="w-full" onClick={onClose}>
            {t('progress.gotIt')}
          </CtaButton>
        </div>
      )}
    </dialog>
  );
};

export default MetricInfo;
