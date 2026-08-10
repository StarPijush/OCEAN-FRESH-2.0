import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmDialog } from '../components/ActionSheet';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { STOREFRONT_URL } from '../env';
import { useAdminSession } from '../hooks/use-auth-session';
import {
  useAdminProfile,
  useSettings,
  useUpdateAdminProfile,
  useUpdateSettings,
} from '../hooks/use-settings';
import { getAuthProvider, resetPassword } from '../services/auth.service';
import { colors, radius, shadows, spacing } from '../theme';
import { errorToMessage } from '../utils/error';

type SaveState =
  { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string };

interface GroupProps {
  title: string;
  children: React.ReactNode;
}

function Group({ title, children }: GroupProps) {
  return (
    <View style={styles.group}>
      <AppText variant="title">{title}</AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function parseAmount(value: string): number | undefined {
  const n = parseFloat(value);
  return isNaN(n) ? undefined : n;
}

export function SettingsScreen() {
  const session = useAdminSession();
  const { data: settings, isPending } = useSettings();
  const { data: profile } = useAdminProfile(session.user?.id);
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateAdminProfile(session.user?.id);

  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState('');

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [storeState, setStoreState] = useState<SaveState>({ kind: 'idle' });
  const [profileState, setProfileState] = useState<SaveState>({ kind: 'idle' });
  const [passwordState, setPasswordState] = useState<SaveState>({ kind: 'idle' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName);
      setTagline(settings.tagline ?? '');
      setWhatsapp(settings.whatsapp ?? '');
      setDeliveryFee(settings.deliveryFee !== undefined ? String(settings.deliveryFee) : '');
      setFreeDeliveryAbove(
        settings.freeDeliveryAbove !== undefined ? String(settings.freeDeliveryAbove) : '',
      );
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setMobile(profile.mobile ?? '');
    }
  }, [profile]);

  const handleSaveStore = async () => {
    setStoreState({ kind: 'saving' });
    try {
      await updateSettings.mutateAsync({
        storeName: storeName.trim() || settings?.storeName,
        tagline: tagline.trim(),
        whatsapp: whatsapp.trim(),
        deliveryFee: parseAmount(deliveryFee),
        freeDeliveryAbove: parseAmount(freeDeliveryAbove),
      });
      setStoreState({ kind: 'saved' });
    } catch (err) {
      setStoreState({ kind: 'error', message: errorToMessage(err) });
    }
  };

  const handleSaveProfile = async () => {
    if (!session.user?.id) return;
    setProfileState({ kind: 'saving' });
    try {
      await updateProfile.mutateAsync({ fullName: fullName.trim(), mobile: mobile.trim() });
      setProfileState({ kind: 'saved' });
    } catch (err) {
      setProfileState({ kind: 'error', message: errorToMessage(err) });
    }
  };

  const handleSavePassword = async () => {
    if (password.length < 6) {
      setPasswordState({ kind: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordState({ kind: 'error', message: 'Passwords do not match.' });
      return;
    }
    setPasswordState({ kind: 'saving' });
    try {
      await resetPassword(password);
      setPassword('');
      setPasswordConfirm('');
      setPasswordState({ kind: 'saved' });
    } catch (err) {
      setPasswordState({ kind: 'error', message: errorToMessage(err) });
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
      <Group title="Account">
        <TextField
          label="Full name"
          value={fullName}
          onChangeText={(v) => {
            setFullName(v);
            setProfileState({ kind: 'idle' });
          }}
          placeholder="Admin name"
        />
        <TextField
          label="Mobile number"
          value={mobile}
          onChangeText={(v) => {
            setMobile(v);
            setProfileState({ kind: 'idle' });
          }}
          placeholder="+91 00000 00000"
          keyboardType="phone-pad"
        />
        <View style={styles.row}>
          <AppText variant="label" color="mutedBright">
            Signed in as
          </AppText>
          <AppText variant="bodyMedium" style={styles.right}>
            {session.user?.email ?? '—'}
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
        <Button
          label={profileState.kind === 'saving' ? 'Saving…' : 'Save profile'}
          loading={profileState.kind === 'saving'}
          onPress={handleSaveProfile}
        />
        <SaveFeedback state={profileState} />
      </Group>

      <Group title="Password">
        <TextField
          label="New password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setPasswordState({ kind: 'idle' });
          }}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextField
          label="Confirm new password"
          value={passwordConfirm}
          onChangeText={(v) => {
            setPasswordConfirm(v);
            setPasswordState({ kind: 'idle' });
          }}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button
          label={passwordState.kind === 'saving' ? 'Updating…' : 'Change password'}
          loading={passwordState.kind === 'saving'}
          onPress={handleSavePassword}
        />
        <SaveFeedback state={passwordState} />
      </Group>

      <Group title="Store">
        <TextField
          label="Store name"
          value={storeName}
          onChangeText={(v) => {
            setStoreName(v);
            setStoreState({ kind: 'idle' });
          }}
          placeholder={isPending ? 'Loading…' : 'OceanFresh'}
          editable={!isPending}
        />
        <TextField
          label="Tagline"
          value={tagline}
          onChangeText={(v) => {
            setTagline(v);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="Fresh from the sea"
          editable={!isPending}
        />
        <TextField
          label="WhatsApp number (display)"
          value={whatsapp}
          onChangeText={(v) => {
            setWhatsapp(v);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="+91 00000 00000"
          keyboardType="phone-pad"
          editable={!isPending}
        />
        <TextField
          label="Delivery charge (₹)"
          value={deliveryFee}
          onChangeText={(v) => {
            setDeliveryFee(v);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="40"
          keyboardType="numeric"
          editable={!isPending}
        />
        <TextField
          label="Free delivery above (₹)"
          value={freeDeliveryAbove}
          onChangeText={(v) => {
            setFreeDeliveryAbove(v);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="500"
          keyboardType="numeric"
          editable={!isPending}
        />
        <Button
          label={storeState.kind === 'saving' ? 'Saving…' : 'Save store settings'}
          loading={storeState.kind === 'saving'}
          onPress={handleSaveStore}
        />
        <SaveFeedback state={storeState} />
      </Group>

      <Group title="Resources">
        {STOREFRONT_URL ? (
          <Button
            label="View storefront"
            variant="secondary"
            onPress={() => Linking.openURL(STOREFRONT_URL)}
          />
        ) : null}
        <Button label="Sign out" variant="danger" onPress={() => setConfirmOpen(true)} />
      </Group>

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

function SaveFeedback({ state }: { state: SaveState }) {
  if (state.kind === 'saved') {
    return (
      <AppText variant="caption" color="green">
        Saved.
      </AppText>
    );
  }
  if (state.kind === 'error') {
    return (
      <AppText variant="caption" color="warn">
        {state.message}
      </AppText>
    );
  }
  return null;
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
