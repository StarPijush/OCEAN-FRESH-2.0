import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xxxl)',
        textAlign: 'center',
        color: 'var(--color-muted2)',
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '3rem',
            marginBottom: 'var(--space-lg)',
            opacity: 0.3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-h2-size)',
          lineHeight: 'var(--text-h2-line)',
          fontWeight: 'var(--text-h2-weight)',
          color: 'var(--color-cream)',
          margin: '0 0 var(--space-md) 0',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--text-body-sm-size)',
            lineHeight: 'var(--text-body-sm-line)',
            margin: 0,
            maxWidth: '320px',
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: 'var(--space-xl)', width: '100%', maxWidth: '280px' }}>
          {action}
        </div>
      )}
    </div>
  );
};
