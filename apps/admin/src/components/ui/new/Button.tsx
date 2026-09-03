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
      gap: 8,
      borderRadius: '14px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      outline: 'none',
      boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
    };

    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        padding: '8px 16px',
        fontSize: '11px',
        letterSpacing: '0.1em',
      },
      md: {
        padding: '10px 20px',
        fontSize: '12px',
        letterSpacing: '0.12em',
      },
      lg: {
        padding: '12px 24px',
        fontSize: '13px',
        letterSpacing: '0.1em',
      },
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        background: '#0d2035',
        color: '#FFFFFF',
        border: '1px solid #0d2035',
      },
      secondary: {
        background: '#FFFFFF',
        color: '#0d2035',
        border: '1px solid rgba(11,19,15,0.08)',
      },
      ghost: {
        background: '#F8FAF9',
        color: '#0B130F',
        border: '1px solid rgba(11,19,15,0.08)',
      },
      danger: {
        background: '#EF4444',
        color: '#FFFFFF',
        border: '1px solid #EF4444',
      },
      link: {
        background: 'transparent',
        color: '#0d2035',
        border: 'none',
        padding: '4px 8px',
      },
    };

    const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: { background: '#071526', borderColor: '#071526' },
      secondary: { borderColor: '#0d2035', background: '#F8FAF9' },
      ghost: { borderColor: 'rgba(11,19,15,0.12)', background: '#EEF2F0' },
      danger: { background: '#dc2626', borderColor: '#dc2626' },
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
