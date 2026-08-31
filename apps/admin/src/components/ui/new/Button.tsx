import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      border: 'none',
      borderRadius: 'var(--radius-button)',
      fontFamily: 'var(--font-ui)',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 150ms var(--ease-out)',
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      outline: 'none',
    };

    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        padding: '7px 14px',
        fontSize: '11px',
        letterSpacing: '0.1em',
      },
      md: {
        padding: '10px 20px',
        fontSize: '12px',
        letterSpacing: '0.12em',
      },
      lg: {
        padding: '14px 28px',
        fontSize: '13px',
        letterSpacing: '0.1em',
      },
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        background: 'var(--color-aqua)',
        color: 'var(--color-bg)',
      },
      secondary: {
        background: 'var(--color-surface2)',
        color: 'var(--color-cream)',
        border: '1px solid var(--color-border2)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-cream)',
        border: '1px solid var(--color-border2)',
      },
      danger: {
        background: 'var(--color-warn-dim)',
        color: 'var(--color-warn)',
        border: '1px solid transparent',
      },
      link: {
        background: 'transparent',
        color: 'var(--color-aqua)',
        border: 'none',
        padding: '4px 8px',
      },
    };

    const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: { background: 'var(--color-aqua-hover)' },
      secondary: { borderColor: 'var(--color-cream)', background: 'rgba(255,255,255,0.04)' },
      ghost: { borderColor: 'var(--color-cream)', background: 'rgba(255,255,255,0.04)' },
      danger: { background: 'rgba(224,122,101,0.22)' },
      link: { opacity: 0.7 },
    };

    return (
      <button
        ref={ref}
        className={className}
        style={{
          ...baseStyles,
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            Object.assign(e.currentTarget.style, hoverStyles[variant]);
          }
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            Object.assign(e.currentTarget.style, variantStyles[variant]);
          }
          props.onMouseLeave?.(e);
        }}
      >
        {loading ? (
          <span
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
            aria-hidden="true"
          />
        ) : leftIcon ? (
          <span aria-hidden="true">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
