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
    sm: { padding: '16px' },
    md: { padding: '1.75rem' },
    lg: { padding: '1.75rem' },
  };

  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    default: {
      background: '#FFFFFF',
      border: '1px solid rgba(11,19,15,0.06)',
      borderRadius: 18,
      boxShadow: '0 10px 30px rgba(11,19,15,0.04)',
    },
    hover: {
      background: '#FFFFFF',
      border: '1px solid rgba(11,19,15,0.06)',
      borderRadius: 18,
      boxShadow: '0 10px 30px rgba(11,19,15,0.04)',
      cursor: 'pointer',
      transition:
        'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out), transform 150ms var(--ease-out)',
    },
    bordered: {
      background: '#FFFFFF',
      border: '1px solid rgba(11,19,15,0.06)',
      borderRadius: 18,
      boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
    },
  };

  const hoverActiveStyles: Record<CardVariant, React.CSSProperties> = {
    default: {},
    hover: {
      borderColor: 'rgba(11,19,15,0.08)',
      boxShadow: '0 20px 50px rgba(11,19,15,0.08)',
      background: '#FFFFFF',
      transform: 'translateY(-1px)',
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
