import type { ButtonHTMLAttributes } from 'react';

import './CtaButton.scss';

const CTA = [
  'lu-cta inline-flex min-h-[56px] cursor-pointer items-center justify-center gap-2 border-0 px-5 pt-2 pb-3',
  'text-center leading-[1.1] text-primary-contrast',
  'transition-transform duration-[120ms] ease-out enabled:active:translate-y-0.5',
  'disabled:cursor-not-allowed disabled:brightness-[0.7] disabled:grayscale-[0.6] aria-busy:filter-none',
  'focus-visible:outline-none',
  'motion-reduce:transition-none motion-reduce:enabled:active:translate-y-0',
].join(' ');

/**
 * The app's main call-to-action button: a chunky pixel-art block with stepped
 * corners and a bevel. Use it for the one primary action on a screen.
 */
const CtaButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, type = 'button', ...rest }) => (
  <button type={type} className={className ? `${CTA} ${className}` : CTA} {...rest} />
);

export default CtaButton;
