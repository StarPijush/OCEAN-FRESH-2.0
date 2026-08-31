import { useEffect, useState } from 'react';

import { Button } from '../../components/ui/new/Button';
import { Input } from '../../components/ui/new/Input';
import { useToast } from '../../components/ui/new/Toast';
import { STOREFRONT_URL } from '../../env';
import { useAdminSession } from '../../hooks/use-auth-session';
import {
  useAdminProfile,
  useSettings,
  useUpdateAdminProfile,
  useUpdateSettings,
} from '../../hooks/use-settings';
import { getAuthProvider, resetPassword } from '../../services/auth.service';
import { errorToMessage } from '../../utils/error';

type SaveState =
  { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string };

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-cream)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--color-surface2)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}
        >
          ⚙
        </span>
        {title}
      </div>
      {children}
    </div>
  );
}

function SaveFeedback({ state }: { state: SaveState }) {
  if (state.kind === 'saved')
    return (
      <div
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(74,222,128,0.15)',
          border: '1px solid rgba(74,222,128,0.3)',
          color: 'var(--color-green)',
          fontSize: 12,
        }}
      >
        Saved.
      </div>
    );
  if (state.kind === 'error')
    return (
      <div
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: 'var(--color-warn-dim)',
          border: '1px solid var(--color-warn-border)',
          color: 'var(--color-warn)',
          fontSize: 12,
        }}
      >
        {state.message}
      </div>
    );
  return null;
}

function parseAmount(value: string): number | undefined {
  const n = parseFloat(value);
  return isNaN(n) ? undefined : n;
}

export function SettingsScreen() {
  const { show: toast } = useToast();
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
      toast('Store settings saved', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setStoreState({ kind: 'error', message: msg });
      toast(msg, 'error');
    }
  };
  const handleSaveProfile = async () => {
    if (!session.user?.id) return;
    setProfileState({ kind: 'saving' });
    try {
      await updateProfile.mutateAsync({ fullName: fullName.trim(), mobile: mobile.trim() });
      setProfileState({ kind: 'saved' });
      toast('Profile saved', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setProfileState({ kind: 'error', message: msg });
      toast(msg, 'error');
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
      toast('Password updated', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setPasswordState({ kind: 'error', message: msg });
      toast(msg, 'error');
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
        background: 'var(--color-bg)',
        padding: 20,
        paddingBottom: 48,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        overflowY: 'auto',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 300,
            color: 'var(--color-cream)',
          }}
        >
          Settings
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted2)', marginTop: 4 }}>
          Manage your profile, password and store configuration.
        </div>
      </div>

      <Group title="Account">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setProfileState({ kind: 'idle' });
          }}
          placeholder="Admin name"
        />
        <Input
          label="Mobile number"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            setProfileState({ kind: 'idle' });
          }}
          placeholder="+91 00000 00000"
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
          }}
        >
          <span
            style={{
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Signed in as
          </span>
          <span style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
            {session.user?.email ?? '—'}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
          }}
        >
          <span
            style={{
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Role
          </span>
          <span style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
            {profile?.role ?? 'admin'}
          </span>
        </div>
        <Button
          variant="primary"
          loading={profileState.kind === 'saving'}
          onClick={() => void handleSaveProfile()}
        >
          {profileState.kind === 'saving' ? 'Saving…' : 'Save profile'}
        </Button>
        <SaveFeedback state={profileState} />
      </Group>

      <Group title="Password">
        <Input
          label="New password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordState({ kind: 'idle' });
          }}
          type="password"
          secureToggle
        />
        <Input
          label="Confirm new password"
          value={passwordConfirm}
          onChange={(e) => {
            setPasswordConfirm(e.target.value);
            setPasswordState({ kind: 'idle' });
          }}
          type="password"
          secureToggle
        />
        <Button
          variant="primary"
          loading={passwordState.kind === 'saving'}
          onClick={() => void handleSavePassword()}
        >
          {passwordState.kind === 'saving' ? 'Updating…' : 'Change password'}
        </Button>
        <SaveFeedback state={passwordState} />
      </Group>

      <Group title="Store">
        <Input
          label="Store name"
          value={storeName}
          onChange={(e) => {
            setStoreName(e.target.value);
            setStoreState({ kind: 'idle' });
          }}
          placeholder={isPending ? 'Loading…' : 'OceanFresh'}
          disabled={isPending}
        />
        <Input
          label="Tagline"
          value={tagline}
          onChange={(e) => {
            setTagline(e.target.value);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="Fresh from the sea"
          disabled={isPending}
        />
        <Input
          label="WhatsApp number (display)"
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(e.target.value);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="+91 00000 00000"
          disabled={isPending}
        />
        <Input
          label="Delivery charge (₹)"
          value={deliveryFee}
          onChange={(e) => {
            setDeliveryFee(e.target.value);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="40"
          type="number"
          disabled={isPending}
        />
        <Input
          label="Free delivery above (₹)"
          value={freeDeliveryAbove}
          onChange={(e) => {
            setFreeDeliveryAbove(e.target.value);
            setStoreState({ kind: 'idle' });
          }}
          placeholder="500"
          type="number"
          disabled={isPending}
        />
        <Button
          variant="primary"
          loading={storeState.kind === 'saving'}
          onClick={() => void handleSaveStore()}
        >
          {storeState.kind === 'saving' ? 'Saving…' : 'Save store settings'}
        </Button>
        <SaveFeedback state={storeState} />
      </Group>

      <Group title="Resources">
        {STOREFRONT_URL ? (
          <Button variant="ghost" onClick={() => window.open(STOREFRONT_URL, '_blank', 'noopener')}>
            View storefront
          </Button>
        ) : null}
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Sign out
        </Button>
      </Group>

      {confirmOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            padding: 20,
          }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border2)',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                color: 'var(--color-cream)',
                marginBottom: 8,
              }}
            >
              Sign out?
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-muted2)', marginBottom: 20 }}>
              You will need your password to sign back in.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" loading={signingOut} onClick={() => void handleSignOut()}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
