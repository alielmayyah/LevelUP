import { useEffect } from 'react';

import './PixelToast.css';

/** A short message above the tab bar that hides itself. Announced politely to screen readers. */
const PixelToast: React.FC<{ message: string | null; onDone: () => void; duration?: number }> = ({
  message,
  onDone,
  duration = 2500,
}) => {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(id);
  }, [message, onDone, duration]);

  return (
    <div className="lu-toast-region" role="status" aria-live="polite">
      {message && (
        <p className="lu-toast" data-testid="toast">
          {message}
        </p>
      )}
    </div>
  );
};

export default PixelToast;
