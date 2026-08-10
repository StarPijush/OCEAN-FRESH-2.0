import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { BrandMark } from './BrandMark';
import { Button } from './Button';

/**
 * Full-screen state shown when the admin session could not be resolved
 * (network error, profile lookup failure). This is NOT "logged out" — the
 * user is asked to retry, never silently redirected to the login stack.
 */
export function SessionError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <BrandMark size={48} />
        <AppText variant="label" color="mutedBright" style={styles.eyebrow}>
          Admin Panel · Session Error
        </AppText>
        <AppText variant="heading" style={styles.title}>
          Could not resolve your session
        </AppText>
        <AppText variant="body" color="mutedBright" style={styles.sub}>
          {message || 'An unexpected error occurred.'}
        </AppText>
        <Button label="Try Again" fullWidth onPress={onRetry} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  eyebrow: { letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { textAlign: 'center' },
  sub: { textAlign: 'center', lineHeight: 22, marginBottom: spacing.sm },
});
