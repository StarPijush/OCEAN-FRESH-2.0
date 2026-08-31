import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

export type IconButtonVariant = 'default' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      children,
      'aria-label': ariaLabel,
      disabled,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const sizeStyles: Record<IconButtonSize, React.CSSProperties> = {
      sm: { width: '24px', height: '24px', fontSize: '12px' },
      md: { width: '28px', height: '28px', fontSize: '14px' },
      lg: { width: '36px', height: '36px', fontSize: '16px' },
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-button)',
      background: 'transparent',
      border: '1px solid var(--color-border2)',
      color: 'var(--color-muted2)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 150ms var(--ease-out)',
      opacity: disabled ? 0.5 : 1,
      flexShrink: 0,
      outline: 'none',
      ...sizeStyles[size],
      ...style,
    };

    const variantHoverStyles: Record<IconButtonVariant, React.CSSProperties> = {
      default: {
        borderColor: 'var(--color-aqua-border)',
        color: 'var(--color-aqua)',
        background: 'var(--color-aqua-dim)',
      },
      danger: {
        borderColor: 'var(--color-warn-border)',
        color: 'var(--color-warn)',
        background: 'var(--color-warn-dim)',
      },
    };

    return (
      <button
        ref={ref}
        className={className}
        style={baseStyles}
        disabled={disabled}
        aria-label={ariaLabel}
        {...props}
        onMouseEnter={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, variantHoverStyles[variant]);
          }
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, baseStyles);
          }
          props.onMouseLeave?.(e);
        }}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
