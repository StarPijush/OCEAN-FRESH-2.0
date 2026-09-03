import { Icon } from '../../../components/Icon';
import { Button } from '../../../components/ui/new/Button';

interface Props {
  message: string;
  onRetry: () => void;
}

export function ChartErrorState({ message, onRetry }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--color-muted)',
        minHeight: 200,
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--color-warn-dim)',
          color: 'var(--color-warn)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          marginBottom: '16px',
        }}
        aria-hidden="true"
      >
        <Icon name="alert-circle" size={24} color="currentColor" />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px 0',
        }}
      >
        Unable to load chart
      </h3>
      <p
        style={{
          fontSize: 13,
          color: 'var(--color-muted)',
          margin: '0 0 16px 0',
          maxWidth: '280px',
        }}
      >
        {message}
      </p>
      <Button variant="primary" onClick={onRetry} size="sm">
        Try again
      </Button>
    </div>
  );
}
