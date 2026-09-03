import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
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
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 9999,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.14)',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          marginBottom: 16,
        }}
        aria-hidden="true"
      >
        ⚠
      </div>
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
      <p
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13,
          lineHeight: 1.6,
          color: '#6C7E75',
          margin: '0 0 20px 0',
          maxWidth: 320,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
