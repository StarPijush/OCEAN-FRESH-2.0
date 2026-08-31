import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warn' | 'danger' | 'info' | 'neutral' | 'aqua' | 'gold';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  style,
}) => {
  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    success: {
      background: 'var(--color-green-dim)',
      color: 'var(--color-green)',
      borderColor: 'var(--color-green-border)',
    },
    warn: {
      background: 'var(--color-warn-dim)',
      color: 'var(--color-warn)',
      borderColor: 'var(--color-warn-border)',
    },
    danger: {
      background: 'var(--color-warn-dim)',
      color: 'var(--color-warn)',
      borderColor: 'var(--color-warn-border)',
    },
    info: {
      background: 'rgba(56,189,248,0.12)',
      color: '#38bdf8',
      borderColor: 'rgba(56,189,248,0.3)',
    },
    neutral: {
      background: 'rgba(255,255,255,0.05)',
      color: 'var(--color-muted2)',
      borderColor: 'transparent',
    },
    aqua: {
      background: 'var(--color-aqua-dim)',
      color: 'var(--color-aqua)',
      borderColor: 'var(--color-aqua-border)',
    },
    gold: {
      background: 'var(--color-gold-dim)',
      color: 'var(--color-gold)',
      borderColor: 'var(--color-gold-border)',
    },
  };

  const sizeStyles = {
    sm: {
      padding: '2px 6px',
      fontSize: '10px',
      letterSpacing: '0.06em',
    },
    md: {
      padding: '3px 8px',
      fontSize: '11px',
      letterSpacing: '0.06em',
    },
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: 'var(--radius-badge)',
    fontFamily: 'var(--font-ui)',
    fontWeight: 600,
    textTransform: 'uppercase',
    border: '1px solid',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span className={className} style={baseStyles}>
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'currentColor',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
