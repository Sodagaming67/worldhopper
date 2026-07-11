import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANT_BG: Record<Variant, string> = {
  primary: 'var(--color-sun-gold)',
  secondary: 'var(--color-cloud)',
  ghost: 'transparent',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
};

export function Button({ variant = 'primary', children, fullWidth, className = '', style, ...rest }: Props) {
  const base =
    'tap-target px-6 py-3 text-lg font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed';
  const decorated =
    variant === 'ghost'
      ? base
      : `${base} cartoon-border cartoon-shadow cartoon-shadow-hover`;
  return (
    <button
      className={`${decorated} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ background: VARIANT_BG[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
