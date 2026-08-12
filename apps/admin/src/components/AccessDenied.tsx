import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { BrandMark } from './BrandMark';
import { Button } from './Button';

/**
 * Full-screen state shown when a valid Supabase session belongs to a user
 * without an admin role (no admin_profiles row, or role not in
 * admin/super_admin). Mirrors the previous "No admin access" screen.
 */
export function AccessDenied({
  onSignOut,
  signingOut = false,
}: {
  onSignOut: () => void;
  signingOut?: boolean;
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
          Admin Panel · Access Denied
        </AppText>
        <AppText variant="heading" style={{ textAlign: 'center' }}>
          No admin access
        </AppText>
        <AppText
          variant="body"
          color="mutedBright"
          style={{ textAlign: 'center', lineHeight: '22px', marginBottom: spacing.sm }}
        >
          Your account is not registered as an administrator in admin_profiles, or your role is not
          granted admin access.
        </AppText>
        <Button
          label="Sign in with a different account"
          fullWidth
          loading={signingOut}
          onPress={onSignOut}
        />
      </div>
    </div>
  );
}
