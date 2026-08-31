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
        padding: 'var(--space-xxxl)',
        textAlign: 'center',
        color: 'var(--color-muted2)',
        ...style,
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--color-warn-dim)',
          color: 'var(--color-warn)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: 'var(--space-lg)',
        }}
        aria-hidden="true"
      >
        ⚠
      </div>
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
      <p
        style={{
          fontSize: 'var(--text-body-sm-size)',
          lineHeight: 'var(--text-body-sm-line)',
          margin: '0 0 var(--space-xl) 0',
          maxWidth: '320px',
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
