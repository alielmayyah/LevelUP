import type { ButtonHTMLAttributes } from 'react';

import './CtaButton.scss';

const CTA = [
  'lu-cta inline-flex min-h-[56px] cursor-pointer items-center justify-center gap-2 border-0 px-7 py-3',
  'text-center leading-[1.1]',
  'transition-[transform,box-shadow] duration-[150ms] ease-out enabled:active:scale-[0.97]',
  'disabled:cursor-not-allowed disabled:opacity-40 aria-busy:opacity-100',
  'focus-visible:outline-none',
  'motion-reduce:transition-none motion-reduce:enabled:active:scale-100',
].join(' ');

/**
 * The app's main call-to-action button: an ink pill (white at night) with a
 * soft shadow. Use it for the one primary action on a screen.
 */
const CtaButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, type = 'button', ...rest }) => (
  <button type={type} className={className ? `${CTA} ${className}` : CTA} {...rest} />
);

export default CtaButton;
