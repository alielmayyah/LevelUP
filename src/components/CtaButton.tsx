import type { ButtonHTMLAttributes } from 'react';

import './CtaButton.css';

/**
 * The app's main call-to-action button, first seen as "Tap to Begin" on the
 * splash. Use it for the one primary action on a screen.
 */
const CtaButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, type = 'button', ...rest }) => (
  <button type={type} className={['lu-cta', className].filter(Boolean).join(' ')} {...rest} />
);

export default CtaButton;
