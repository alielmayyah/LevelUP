import type { ButtonHTMLAttributes } from 'react';

import './CtaButton.scss';

const CTA = [
  'lu-cta inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[23px] border-2 border-splash-bg px-5 py-2',
  'font-inherit text-center text-base leading-[1.3] font-bold text-primary-contrast',
  'transition-transform duration-[120ms] ease-out enabled:active:translate-y-0.5',
  'disabled:cursor-not-allowed disabled:brightness-[0.7] disabled:grayscale-[0.6] aria-busy:filter-none',
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-splash-text',
  'motion-reduce:transition-none motion-reduce:enabled:active:translate-y-0',
].join(' ');

/**
 * The app's main call-to-action button, first seen as "Tap to Begin" on the
 * splash. Use it for the one primary action on a screen.
 */
const CtaButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, type = 'button', ...rest }) => (
  <button type={type} className={className ? `${CTA} ${className}` : CTA} {...rest} />
);

export default CtaButton;
