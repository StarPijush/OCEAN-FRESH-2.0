import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { BrandMark } from './BrandMark';
import { Button } from './Button';

/**
 * Full-screen state shown when a valid Supabase session belongs to a user
 * without an admin role (no admin_profiles row, or role not in
 * admin/super_admin). Mirrors the web admin's "No admin access" screen.
 */
export function AccessDenied({
  onSignOut,
  signingOut = false,
}: {
  onSignOut: () => void;
  signingOut?: boolean;
}) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <BrandMark size={48} />
        <AppText variant="label" color="mutedBright" style={styles.eyebrow}>
          Admin Panel · Access Denied
        </AppText>
        <AppText variant="heading" style={styles.title}>
          No admin access
        </AppText>
        <AppText variant="body" color="mutedBright" style={styles.sub}>
          Your account is not registered as an administrator in admin_profiles, or your role is not
          granted admin access.
        </AppText>
        <Button
          label="Sign in with a different account"
          fullWidth
          loading={signingOut}
          onPress={onSignOut}
        />
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
