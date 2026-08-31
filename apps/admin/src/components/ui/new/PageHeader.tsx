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
        gap: 'var(--space-lg)',
        flexWrap: 'wrap',
        padding: 'var(--space-lg) 0',
        borderBottom: '1px solid var(--color-border)',
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
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h1-size)',
            lineHeight: 'var(--text-h1-line)',
            fontWeight: 'var(--text-h1-weight)',
            letterSpacing: 'var(--text-h1-tracking)',
            color: 'var(--color-cream)',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-body-sm-size)',
              lineHeight: 'var(--text-body-sm-line)',
              color: 'var(--color-muted2)',
              margin: 'var(--space-xs) 0 0 0',
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
