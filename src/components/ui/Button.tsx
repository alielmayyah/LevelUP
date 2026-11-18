import type { ButtonHTMLAttributes, ReactNode } from 'react';

import Icon, { type IconName } from '../Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

const VARIANT: Record<ButtonVariant, string> = {
  // One per screen: the brand's strong shade under its own label color.
  primary: 'min-h-[52px] w-full rounded-[16px] bg-brand-strong px-5 text-on-brand',
  secondary: 'min-h-11 rounded-[16px] bg-brand-tint px-4 text-brand-soft',
  // No preflight in this app: a button without a background would show the browser's grey.
  quiet: 'min-h-11 rounded-[12px] bg-transparent px-2 text-brand-soft',
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}

/** The redesign's button (ui-standards → Components). Disabled is 40% opacity. */
export function Button({ variant = 'primary', icon, children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`lu-press lu-focus inline-flex items-center justify-center gap-2 border-0 font-inherit text-label disabled:opacity-40 ${VARIANT[variant]} ${className ?? ''}`}
      data-variant={variant}
      {...rest}
    >
      {icon && <Icon name={icon} className="shrink-0 text-[1.15em] rtl:-scale-x-100" />}
      <span>{children}</span>
    </button>
  );
}

export default Button;
