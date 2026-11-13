import { useEffect, useId, useRef } from 'react';

import './PixelDialog.css';

interface Props {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Styles the confirm button as a destructive action (sign out). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A confirm dialog in the pixel style, built on the native <dialog>: it traps
 * focus, closes with Escape (and the Android back gesture in the web view), and
 * costs a few hundred bytes instead of Ionic's alert overlay.
 */
const PixelDialog: React.FC<Props> = ({ open, title, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
      className="lu-dialog"
      aria-labelledby={titleId}
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
        <div className="lu-dialog-box">
          <h2 id={titleId} className="lu-dialog-title">
            {title}
          </h2>
          <div className="lu-dialog-actions">
            <button type="button" className="lu-dialog-button" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`lu-dialog-button lu-dialog-confirm${destructive ? ' is-destructive' : ''}`}
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

export default PixelDialog;
