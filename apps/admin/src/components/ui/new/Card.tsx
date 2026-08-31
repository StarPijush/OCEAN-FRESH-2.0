import type { ReactNode } from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'hover' | 'bordered';

export interface CardProps {
  children: ReactNode;
  padding?: CardPadding;
  variant?: CardVariant;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  variant = 'default',
  className = '',
  style,
  onClick,
}) => {
  const paddingStyles: Record<CardPadding, React.CSSProperties> = {
    none: { padding: 0 },
    sm: { padding: 'var(--space-sm)' },
    md: { padding: 'var(--space-lg)' },
    lg: { padding: 'var(--space-xl)' },
  };

  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    default: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
    },
    hover: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      cursor: 'pointer',
      transition:
        'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out), background 150ms var(--ease-out)',
    },
    bordered: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border2)',
      borderRadius: 'var(--radius-card)',
    },
  };

  const hoverActiveStyles: Record<CardVariant, React.CSSProperties> = {
    default: {},
    hover: {
      borderColor: 'var(--color-border2)',
      boxShadow: 'var(--shadow-card-hover)',
      background: 'rgba(255,255,255,0.02)',
    },
    bordered: {},
  };

  return (
    <div
      className={className}
      style={{
        ...variantStyles[variant],
        ...paddingStyles[padding],
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick && variant === 'hover') {
          Object.assign(e.currentTarget.style, hoverActiveStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && variant === 'hover') {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};
