import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmDialog } from '../components/ActionSheet';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { STOREFRONT_URL } from '../env';
import { useAdminSession } from '../hooks/use-auth-session';
import { useAdminProfile, useSettings, useUpdateSettings } from '../hooks/use-settings';
import { getAuthProvider } from '../services/auth.service';
import { colors, radius, shadows, spacing } from '../theme';
import { errorToMessage } from '../utils/error';

type SaveState =
  { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string };

export function SettingsScreen() {
  const session = useAdminSession();
  const { data: settings, isPending } = useSettings();
  const { data: profile } = useAdminProfile(session.user?.id);
  const updateSettings = useUpdateSettings();

  const [storeName, setStoreName] = useState('');
  const [saveState, setSaveState] = useState<SaveState>({ kind: 'idle' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (settings) setStoreName(settings.storeName);
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaveState({ kind: 'saving' });
    try {
      await updateSettings.mutateAsync({ storeName: storeName.trim() || settings.storeName });
      setSaveState({ kind: 'saved' });
    } catch (err) {
      setSaveState({ kind: 'error', message: errorToMessage(err) });
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await getAuthProvider().logout();
    } finally {
      setSigningOut(false);
      setConfirmOpen(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.group}>
        <AppText variant="title">Account</AppText>
        <View style={styles.card}>
          <View style={styles.row}>
            <AppText variant="label" color="mutedBright">
              Signed in as
            </AppText>
            <AppText variant="bodyMedium" style={styles.right}>
              {profile?.fullName ?? session.user?.email ?? '—'}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText variant="label" color="mutedBright">
              Role
            </AppText>
            <AppText variant="bodyMedium" style={styles.right}>
              {profile?.role ?? 'admin'}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.group}>
        <AppText variant="title">Store</AppText>
        <View style={styles.card}>
          <TextField
            label="Store name"
            value={storeName}
            onChangeText={(v) => {
              setStoreName(v);
              setSaveState({ kind: 'idle' });
            }}
            placeholder={isPending ? 'Loading…' : 'OceanFresh'}
            editable={!isPending}
          />
          <Button
            label={saveState.kind === 'saving' ? 'Saving…' : 'Save changes'}
            loading={saveState.kind === 'saving'}
            onPress={handleSave}
          />
          {saveState.kind === 'saved' ? (
            <AppText variant="caption" color="green">
              Store settings saved.
            </AppText>
          ) : saveState.kind === 'error' ? (
            <AppText variant="caption" color="warn">
              {saveState.message}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.group}>
        <AppText variant="title">Resources</AppText>
        <View style={styles.card}>
          {STOREFRONT_URL ? (
            <Button
              label="View storefront"
              variant="secondary"
              onPress={() => Linking.openURL(STOREFRONT_URL)}
            />
          ) : null}
          <Button label="Sign out" variant="danger" onPress={() => setConfirmOpen(true)} />
        </View>
      </View>

      <ConfirmDialog
        visible={confirmOpen}
        title="Sign out?"
        message="You will need your password to sign back in."
        confirmLabel="Sign out"
        danger
        loading={signingOut}
        onConfirm={handleSignOut}
        onClose={() => setConfirmOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl },
  group: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.lg,
  },
  right: { textAlign: 'right', flexShrink: 1 },
});
