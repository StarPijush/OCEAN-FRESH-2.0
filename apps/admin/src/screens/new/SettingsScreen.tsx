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
        background: '#FFFFFF',
        border: '1px solid rgba(11,19,15,0.06)',
        borderRadius: 18,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxShadow: '0 2px 8px rgba(11,19,15,0.02)',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: '#0B130F',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingBottom: 16,
          borderBottom: '1px solid rgba(11,19,15,0.06)',
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#F8FAF9',
            border: '1px solid rgba(11,19,15,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: '#6C7E75',
            flexShrink: 0,
          }}
        >
          ⚙
        </span>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

function SaveFeedback({ state }: { state: SaveState }) {
  if (state.kind === 'saved')
    return (
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.14)',
          color: '#16a34a',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        ✓ Saved.
      </div>
    );
  if (state.kind === 'error')
    return (
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.14)',
          color: '#EF4444',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
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
        background: '#F4F6F5',
        padding: '24px 16px',
        paddingBottom: 48,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        overflowY: 'auto',
        overflowX: 'hidden',
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ padding: '0 8px' }}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#0B130F',
            lineHeight: 1.2,
          }}
        >
          Settings
        </div>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
            color: '#6C7E75',
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
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
            padding: '12px 16px',
            background: '#F8FAF9',
            borderRadius: 12,
            border: '1px solid rgba(11,19,15,0.06)',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 10,
              color: '#6C7E75',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Signed in as
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              color: '#0B130F',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              textAlign: 'right',
            }}
          >
            {session.user?.email ?? '—'}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: '#F8FAF9',
            borderRadius: 12,
            border: '1px solid rgba(11,19,15,0.06)',
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 10,
              color: '#6C7E75',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
            }}
          >
            Role
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              color: '#0B130F',
              fontWeight: 600,
            }}
          >
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
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11,19,15,0.5)',
            backdropFilter: 'blur(4px)',
            padding: 20,
            animation: 'fadeIn 200ms var(--ease-out)',
          }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(11,19,15,0.06)',
              borderRadius: 18,
              padding: 24,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 30px 60px rgba(11,19,15,0.12)',
              animation: 'scaleIn 200ms var(--ease-out)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#0B130F',
                marginBottom: 8,
              }}
            >
              Sign out?
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                color: '#6C7E75',
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
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
