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
        padding: 32,
        textAlign: 'center',
        color: '#6C7E75',
        background: '#FFFFFF',
        border: '1px solid rgba(11,19,15,0.06)',
        borderRadius: 18,
        boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '2.5rem',
            marginBottom: 16,
            opacity: 0.35,
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
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: '#0B130F',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13,
            lineHeight: 1.6,
            color: '#6C7E75',
            margin: 0,
            maxWidth: 340,
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 20, width: '100%', maxWidth: 280 }}>{action}</div>}
    </div>
  );
};
