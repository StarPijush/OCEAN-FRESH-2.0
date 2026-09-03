import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backButton?: { onClick: () => void; label?: string };
  className?: string;
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  backButton,
  className = '',
  style,
}) => {
  return (
    <header
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
        marginBottom: '32px',
        ...style,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {backButton && (
          <button
            onClick={backButton.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              marginBottom: 'var(--space-sm)',
              background: 'transparent',
              border: '1px solid var(--color-border2)',
              borderRadius: 'var(--radius-button)',
              color: 'var(--color-muted2)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-button-sm-size)',
              fontWeight: 'var(--text-button-sm-weight)',
              letterSpacing: 'var(--text-button-sm-tracking)',
              textTransform: 'var(--text-button-sm-transform)',
              cursor: 'pointer',
              transition: 'all 150ms var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-aqua)';
              e.currentTarget.style.color = 'var(--color-aqua)';
              e.currentTarget.style.background = 'var(--color-aqua-dim)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border2)';
              e.currentTarget.style.color = 'var(--color-muted2)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← {backButton.label || 'Back'}
          </button>
        )}
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.75rem',
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#0B130F',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: '#6C7E75',
              margin: '4px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0, marginTop: 'auto' }}>{action}</div>}
    </header>
  );
};
