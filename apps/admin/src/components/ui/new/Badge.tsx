import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warn' | 'danger' | 'info' | 'neutral' | 'aqua';

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
  // Spark table badges: pill 0.75rem 700 dot6 — aqua maps to info, warn→orange 10%
  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    success: {
      background: 'rgba(34,197,94,0.10)',
      color: '#22C55E',
      borderColor: 'rgba(34,197,94,0.14)',
    },
    warn: {
      background: 'rgba(249,115,22,0.10)',
      color: '#F97316',
      borderColor: 'rgba(249,115,22,0.14)',
    },
    danger: {
      background: 'rgba(239,68,68,0.10)',
      color: '#EF4444',
      borderColor: 'rgba(239,68,68,0.14)',
    },
    info: {
      background: 'rgba(74,184,193,0.10)',
      color: '#0d2035',
      borderColor: 'rgba(74,184,193,0.14)',
    },
    neutral: {
      background: '#F8FAF9',
      color: '#6C7E75',
      borderColor: 'rgba(11,19,15,0.06)',
    },
    aqua: {
      background: 'rgba(74,184,193,0.10)',
      color: '#0d2035',
      borderColor: 'rgba(74,184,193,0.14)',
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
