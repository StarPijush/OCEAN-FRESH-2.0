import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator size="large" color={colors.aqua} />
      <AppText variant="body" color="muted">
        {label}
      </AppText>
    </View>
  );
}

interface ErrorStateProps {
  message: string | null;
  onRetry?: () => void;
  actionLabel?: string;
}

export function ErrorState({ message, onRetry, actionLabel = 'Try again' }: ErrorStateProps) {
  return (
    <View style={styles.state}>
      <AppText variant="body" color="warn" style={styles.center}>
        Something went wrong
      </AppText>
      {message ? (
        <AppText variant="caption" color="muted" style={styles.center}>
          {message}
        </AppText>
      ) : null}
      {onRetry ? (
        <AppText variant="bodySemiBold" color="aqua" onPress={onRetry} style={styles.link}>
          {actionLabel}
        </AppText>
      ) : null}
    </View>
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
    <View style={styles.state}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  center: { textAlign: 'center' },
  link: { marginTop: spacing.sm },
});
