import { BrandMark } from './ui/new/BrandMark';
import { Button } from './ui/new/Button';

export function SessionError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border2)',
          borderRadius: 12,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <BrandMark size="lg" />
        <div
          style={{
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            fontWeight: 600,
          }}
        >
          Admin Panel · Session Error
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            color: 'var(--color-cream)',
            textAlign: 'center',
          }}
        >
          Could not resolve your session
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--color-muted2)',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          {message || 'An unexpected error occurred.'}
        </div>
        <Button variant="primary" fullWidth onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
