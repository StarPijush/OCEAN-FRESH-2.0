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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderStrong}`,
          borderRadius: radius.lg,
          padding: spacing.xl,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: spacing.md,
        }}
      >
        <BrandMark size={48} />
        <AppText
          variant="label"
          color="mutedBright"
          style={{ letterSpacing: 1.5, textTransform: 'uppercase' }}
        >
          Admin Panel · Session Error
        </AppText>
        <AppText variant="heading" style={{ textAlign: 'center' }}>
          Could not resolve your session
        </AppText>
        <AppText
          variant="body"
          color="mutedBright"
          style={{ textAlign: 'center', lineHeight: '22px', marginBottom: spacing.sm }}
        >
          {message || 'An unexpected error occurred.'}
        </AppText>
        <Button label="Try Again" fullWidth onPress={onRetry} />
      </div>
    </div>
  );
}
