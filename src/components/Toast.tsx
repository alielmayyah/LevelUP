import { useEffect } from 'react';

/** A short message above the tab bar that hides itself. Announced politely to screen readers. */
const Toast: React.FC<{ message: string | null; onDone: () => void; duration?: number }> = ({
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
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--lu-tabbar-height)+var(--lu-tabbar-gap)*2+var(--ion-safe-area-bottom,0px))] z-20 grid justify-items-center px-(--lu-gutter)"
      role="status"
      aria-live="polite"
    >
      {message && (
        <p
          className="m-0 max-w-[420px] rounded-full bg-ink px-4 py-2.5 text-[0.9rem] font-semibold text-page shadow-raised"
          data-testid="toast"
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Toast;
