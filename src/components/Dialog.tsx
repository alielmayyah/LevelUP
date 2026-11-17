import { useEffect, useId, useRef } from 'react';

const BUTTON =
  'min-h-[46px] cursor-pointer rounded-[12px] border font-inherit font-semibold transition-transform duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100';

interface Props {
  open: boolean;
  title: string;
  /** Optional plain line under the title: what happens next. */
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Styles the confirm button as a destructive action (sign out). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A confirm dialog in the app style, built on the native <dialog>: it traps
 * focus, closes with Escape (and the Android back gesture in the web view), and
 * costs a few hundred bytes instead of Ionic's alert overlay.
 */
const Dialog: React.FC<Props> = ({ open, title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  // Android back closes the open dialog first, before Ionic navigates
  // (priority 150 beats the router's 0 and matches Ionic's own overlays).
  useEffect(() => {
    if (!open) return;
    const onBack = (e: Event) =>
      (e as CustomEvent<{ register: (priority: number, handler: () => void) => void }>).detail.register(150, onCancel);
    document.addEventListener('ionBackButton', onBack);
    return () => document.removeEventListener('ionBackButton', onBack);
  }, [open, onCancel]);

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
      className="w-[min(calc(100%-32px),360px)] border-0 bg-transparent p-0 text-ink backdrop:bg-scrim/55"
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        // A tap on the backdrop (the dialog element itself) cancels.
        if (e.target === ref.current) onCancel();
      }}
    >
      {open && (
        <div className="lu-pop grid gap-4 rounded-[20px] border border-line bg-surface p-5 shadow-raised ar:font-arabic">
          <h2 id={titleId} className="m-0 text-[1.15rem] leading-[1.3] font-semibold">
            {title}
          </h2>
          {message && (
            <p id={messageId} className="m-0 -mt-2 text-[0.9rem] text-muted">
              {message}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" className={`${BUTTON} border-line bg-surface-2 text-ink`} onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`${BUTTON} ${destructive ? 'border-danger bg-danger text-surface' : 'border-primary bg-primary text-primary-contrast'}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
};

export default Dialog;
