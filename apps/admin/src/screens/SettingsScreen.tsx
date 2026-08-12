import { useEffect, useState } from 'react';

import { ConfirmDialog } from '../components/ActionSheet';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Icon, type IconName } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
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
  icon: IconName;
  children: React.ReactNode;
}

function Group({ title, icon, children }: GroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: radius.md,
            backgroundColor: colors.aquaDim,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={16} color={colors.aqua} />
        </div>
        <AppText variant="title">{title}</AppText>
      </div>
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
          padding: spacing.lg,
          gap: spacing.md,
          display: 'flex',
          flexDirection: 'column',
          ...shadows.card,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SaveFeedback({ state }: { state: SaveState }) {
  if (state.kind === 'saved') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.greenDim,
          borderRadius: radius.md,
          padding: spacing.sm,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
        }}
      >
        <Icon name="checkmark-circle" size={15} color={colors.green} />
        <AppText variant="caption" color="green">
          Saved.
        </AppText>
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.warnDim,
          borderRadius: radius.md,
          padding: spacing.sm,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
        }}
      >
        <Icon name="alert-circle" size={15} color={colors.warn} />
        <AppText variant="caption" color="warn" style={{ flex: 1, lineHeight: 18 }}>
          {state.message}
        </AppText>
      </div>
    );
  }
  return null;
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
    <div
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
        gap: spacing.xl,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, password and store configuration."
      />

      <Group title="Account" icon="person-outline">
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing.lg,
          }}
        >
          <AppText variant="label" color="mutedBright">
            Signed in as
          </AppText>
          <AppText variant="bodyMedium" style={{ textAlign: 'right', flexShrink: 1 }}>
            {session.user?.email ?? '—'}
          </AppText>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing.lg,
          }}
        >
          <AppText variant="label" color="mutedBright">
            Role
          </AppText>
          <AppText variant="bodyMedium" style={{ textAlign: 'right', flexShrink: 1 }}>
            {profile?.role ?? 'admin'}
          </AppText>
        </div>
        <Button
          label={profileState.kind === 'saving' ? 'Saving…' : 'Save profile'}
          loading={profileState.kind === 'saving'}
          onPress={handleSaveProfile}
        />
        <SaveFeedback state={profileState} />
      </Group>

      <Group title="Password" icon="lock-closed-outline">
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

      <Group title="Store" icon="storefront-outline">
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

      <Group title="Resources" icon="link-outline">
        {STOREFRONT_URL ? (
          <Button
            label="View storefront"
            variant="secondary"
            onPress={() => window.open(STOREFRONT_URL, '_blank', 'noopener')}
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
    </div>
  );
}
