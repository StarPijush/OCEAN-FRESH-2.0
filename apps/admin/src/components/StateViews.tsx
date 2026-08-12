import type { ReactNode } from 'react';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Spinner } from './Spinner';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={styles.state}>
      <Spinner size={28} color={colors.aqua} />
      <AppText variant="body" color="muted">
        {label}
      </AppText>
    </div>
  );
}

interface ErrorStateProps {
  message: string | null;
  onRetry?: () => void;
  actionLabel?: string;
}

export function ErrorState({ message, onRetry, actionLabel = 'Try again' }: ErrorStateProps) {
  return (
    <div style={styles.state}>
      <AppText variant="body" color="warn" style={styles.center}>
        Something went wrong
      </AppText>
      {message ? (
        <AppText variant="caption" color="muted" style={styles.center}>
          {message}
        </AppText>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="of-btn"
          style={{ background: 'none', border: 'none', padding: 0, marginTop: spacing.sm }}
        >
          <AppText variant="bodySemiBold" color="aqua">
            {actionLabel}
          </AppText>
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div style={styles.state}>
      {icon}
      <AppText variant="title" style={styles.center}>
        {title}
      </AppText>
      {hint ? (
        <AppText variant="caption" color="muted" style={styles.center}>
          {hint}
        </AppText>
      ) : null}
      {action}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  state: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: spacing.md,
    padding: `${spacing.xxl * 2}px ${spacing.xl}px`,
  },
  center: { textAlign: 'center' },
};
