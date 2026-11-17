/*
 * The splash's loading indicator: a thin rounded line that fills smoothly,
 * eased, over the splash's timer. Splash.scss runs the fill; with reduced
 * motion the line shows full and still.
 */
const LoadingLine: React.FC<{ label: string; durationMs: number }> = ({ label, durationMs }) => (
  <div
    className="lu-splash-loading relative h-1.5 w-[clamp(132px,40vw,184px)] overflow-hidden rounded-full"
    role="status"
    aria-label={label}
    style={{ '--lu-splash-ms': `${durationMs}ms` } as React.CSSProperties}
  >
    <span className="lu-splash-loading-fill absolute inset-0 rounded-full" aria-hidden="true" />
  </div>
);

export default LoadingLine;
