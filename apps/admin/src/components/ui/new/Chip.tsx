import type { MouseEvent, ReactNode } from 'react';

export type ChipVariant = 'default' | 'active';

export interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  count?: number;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  count,
  onClick,
  onRemove,
  removable = false,
  disabled = false,
  className = '',
  style,
}) => {
  const isActive = variant === 'active';

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: 'var(--radius-badge)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--text-button-size)',
    lineHeight: 'var(--text-button-line)',
    fontWeight: 'var(--text-button-weight)',
    letterSpacing: 'var(--text-button-tracking)',
    textTransform: 'var(--text-button-transform)',
    cursor: disabled ? 'not-allowed' : onClick || onRemove ? 'pointer' : 'default',
    transition: 'all 150ms var(--ease-out)',
    opacity: disabled ? 0.5 : 1,
    border: '1px solid',
    userSelect: 'none',
    ...style,
  };

  const variantStyles = {
    default: {
      background: 'transparent',
      color: 'var(--color-cream)',
      borderColor: 'var(--color-border2)',
    },
    active: {
      background: 'var(--color-aqua)',
      color: 'var(--color-bg)',
      borderColor: 'var(--color-aqua)',
    },
  };

  const hoverStyles = {
    default: {
      borderColor: 'var(--color-cream)',
      background: 'rgba(255,255,255,0.04)',
    },
    active: {
      background: 'var(--color-aqua-hover)',
      borderColor: 'var(--color-aqua-hover)',
    },
  };

  const handleMouseEnter = (e: MouseEvent<HTMLSpanElement>) => {
    if (!disabled && (onClick || onRemove)) {
      Object.assign(e.currentTarget.style, hoverStyles[variant]);
    }
  };

  const handleMouseLeave = (e: MouseEvent<HTMLSpanElement>) => {
    if (!disabled && (onClick || onRemove)) {
      Object.assign(e.currentTarget.style, variantStyles[variant]);
    }
  };

  return (
    <span
      className={className}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick || onRemove ? 0 : -1}
      role={onClick || onRemove ? 'button' : undefined}
      aria-disabled={disabled}
      aria-pressed={isActive}
    >
      {children}
      {count !== undefined && (
        <span
          style={{
            background: isActive ? 'rgba(13,15,18,0.2)' : 'var(--color-surface2)',
            color: isActive ? 'var(--color-cream)' : 'var(--color-muted2)',
            padding: '1px 5px',
            borderRadius: 'var(--radius-badge)',
            fontSize: '10px',
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
      {removable && !disabled && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.6,
            padding: 0,
            lineHeight: 1,
            marginLeft: '2px',
          }}
          aria-label="Remove"
        >
          ✕
        </button>
      )}
    </span>
  );
};
