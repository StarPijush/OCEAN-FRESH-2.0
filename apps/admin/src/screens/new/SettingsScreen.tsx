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

function Group({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          paddingBottom: 16,
          borderBottom: '1px solid rgba(11,19,15,0.06)',
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
        {subtitle ? (
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.8rem',
              color: '#6C7E75',
              lineHeight: 1.5,
              paddingLeft: 42,
            }}
          >
            {subtitle}
          </div>
        ) : null}
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
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = parseFloat(trimmed);
  return isNaN(n) ? undefined : n;
}

function isValidEmail(v: string): boolean {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return false;
  return /^\+?[\d\s\-()]{10,22}$/.test(v.trim());
}

function isValidUrl(v: string): boolean {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidLatitude(v: string): boolean {
  if (v.trim() === '') return true; // empty is allowed (clears field)
  const n = Number(v);
  return Number.isFinite(n) && n >= -90 && n <= 90;
}

function isValidLongitude(v: string): boolean {
  if (v.trim() === '') return true;
  const n = Number(v);
  return Number.isFinite(n) && n >= -180 && n <= 180;
}

function isValidPostal(v: string): boolean {
  if (v.trim() === '') return true;
  return /^\d{6}$/.test(v.trim());
}

export function SettingsScreen() {
  const { show: toast } = useToast();
  const session = useAdminSession();
  const { data: settings, isPending } = useSettings();
  const { data: profile } = useAdminProfile(session.user?.id);
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateAdminProfile(session.user?.id);

  // ── Store ──────────────────────────────────────────────────────────
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState('');
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({});

  // ── Contact ────────────────────────────────────────────────────────
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [email, setEmail] = useState('');
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  // ── Location ───────────────────────────────────────────────────────
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({});

  // ── Hours ──────────────────────────────────────────────────────────
  const [hoursWeekdays, setHoursWeekdays] = useState('');
  const [hoursSunday, setHoursSunday] = useState('');
  const [hoursErrors, setHoursErrors] = useState<Record<string, string>>({});

  // ── Social ── active: Instagram, Facebook, YouTube only (WhatsApp via Store whatsapp)
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [socialErrors, setSocialErrors] = useState<Record<string, string>>({});

  // ── Account / Password ─────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [storeState, setStoreState] = useState<SaveState>({ kind: 'idle' });
  const [contactState, setContactState] = useState<SaveState>({ kind: 'idle' });
  const [locationState, setLocationState] = useState<SaveState>({ kind: 'idle' });
  const [hoursState, setHoursState] = useState<SaveState>({ kind: 'idle' });
  const [socialState, setSocialState] = useState<SaveState>({ kind: 'idle' });
  const [profileState, setProfileState] = useState<SaveState>({ kind: 'idle' });
  const [passwordState, setPasswordState] = useState<SaveState>({ kind: 'idle' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName ?? '');
      setTagline(settings.tagline ?? '');
      setWhatsapp(settings.whatsapp ?? '');
      setDeliveryFee(settings.deliveryFee != null ? String(settings.deliveryFee) : '');
      setFreeDeliveryAbove(
        settings.freeDeliveryAbove != null ? String(settings.freeDeliveryAbove) : '',
      );
      // Contact
      setPhoneDisplay(settings.phoneDisplay ?? '');
      setPhoneRaw(settings.phoneRaw ?? '');
      setEmail(settings.email ?? '');
      // Location
      setAddressLine1(settings.addressLines?.[0] ?? '');
      setAddressLine2(settings.addressLines?.[1] ?? '');
      setCity(settings.city ?? '');
      setStateVal(settings.state ?? '');
      setPostalCode(settings.postalCode ?? '');
      setLatitude(settings.latitude != null ? String(settings.latitude) : '');
      setLongitude(settings.longitude != null ? String(settings.longitude) : '');
      setGoogleMapsUrl(settings.googleMapsUrl ?? '');
      // Hours: keep 2 strings model
      setHoursWeekdays(settings.hours?.[0] ?? '');
      setHoursSunday(settings.hours?.[1] ?? '');
      // Social — active 3 only (X/LinkedIn legacy columns ignored)
      setInstagramUrl(settings.instagramUrl ?? '');
      setFacebookUrl(settings.facebookUrl ?? '');
      setYoutubeUrl(settings.youtubeUrl ?? '');
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setMobile(profile.mobile ?? '');
    }
  }, [profile]);

  const handleSaveStore = async () => {
    const errs: Record<string, string> = {};
    if (!storeName.trim()) errs.storeName = 'Store name is required.';
    if (tagline.trim().length > 120) errs.tagline = 'Tagline must be under 120 characters.';
    if (whatsapp.trim() && !isValidPhone(whatsapp.trim()))
      errs.whatsapp = 'Enter a valid WhatsApp number.';
    const df = deliveryFee.trim() ? parseAmount(deliveryFee) : undefined;
    const fda = freeDeliveryAbove.trim() ? parseAmount(freeDeliveryAbove) : undefined;
    if (deliveryFee.trim() && (df == null || df < 0)) errs.deliveryFee = 'Must be 0 or more.';
    if (freeDeliveryAbove.trim() && (fda == null || fda < 0))
      errs.freeDeliveryAbove = 'Must be 0 or more.';
    setStoreErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStoreState({ kind: 'error', message: 'Fix the highlighted fields.' });
      return;
    }
    setStoreState({ kind: 'saving' });
    try {
      await updateSettings.mutateAsync({
        storeName: storeName.trim() || settings?.storeName,
        tagline: tagline.trim(),
        whatsapp: whatsapp.trim(),
        deliveryFee: df,
        freeDeliveryAbove: fda,
      });
      setStoreState({ kind: 'saved' });
      toast('Store settings saved', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setStoreState({ kind: 'error', message: msg });
      toast(msg, 'error');
    }
  };

  const handleSaveContact = async () => {
    const errs: Record<string, string> = {};
    if (phoneDisplay.trim() && !isValidPhone(phoneDisplay.trim()))
      errs.phoneDisplay = 'Enter a valid display phone.';
    if (phoneRaw.trim() && !isValidPhone(phoneRaw.trim()))
      errs.phoneRaw = 'Enter a valid phone (e.g. +919876543210).';
    if (email.trim() && !isValidEmail(email.trim())) errs.email = 'Enter a valid email.';
    setContactErrors(errs);
    if (Object.keys(errs).length > 0) {
      setContactState({ kind: 'error', message: 'Fix the highlighted fields.' });
      return;
    }
    setContactState({ kind: 'saving' });
    try {
      await updateSettings.mutateAsync({
        phoneDisplay: phoneDisplay.trim() ? phoneDisplay.trim() : null,
        phoneRaw: phoneRaw.trim() ? phoneRaw.trim() : null,
        email: email.trim() ? email.trim() : null,
      } as unknown as Record<string, unknown> as never);
      setContactState({ kind: 'saved' });
      toast('Contact settings saved', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setContactState({ kind: 'error', message: msg });
      toast(msg, 'error');
    }
  };

  const handleSaveLocation = async () => {
    const errs: Record<string, string> = {};
    if (!isValidLatitude(latitude)) errs.latitude = 'Latitude must be between -90 and 90.';
    if (!isValidLongitude(longitude)) errs.longitude = 'Longitude must be between -180 and 180.';
    if (googleMapsUrl.trim() && !isValidUrl(googleMapsUrl.trim()))
      errs.googleMapsUrl = 'Enter a valid https:// URL.';
    if (!isValidPostal(postalCode)) errs.postalCode = 'Enter a valid 6-digit PIN.';
    if (latitude.trim() && !longitude.trim()) errs.longitude = 'Longitude required with latitude.';
    if (longitude.trim() && !latitude.trim()) errs.latitude = 'Latitude required with longitude.';
    setLocationErrors(errs);
    if (Object.keys(errs).length > 0) {
      setLocationState({ kind: 'error', message: 'Fix the highlighted fields.' });
      return;
    }
    setLocationState({ kind: 'saving' });
    try {
      const lines: string[] = [];
      const l1 = addressLine1.trim();
      const l2 = addressLine2.trim();
      if (l1) lines.push(l1);
      if (l2) lines.push(l2);
      // If custom city/state/postal are provided but line2 empty, we still keep addressLines as entered
      // City/State/Postal are stored separately and also compose fallback display
      const latVal = latitude.trim() ? Number(latitude.trim()) : null;
      const lngVal = longitude.trim() ? Number(longitude.trim()) : null;
      const mapsUrlVal = googleMapsUrl.trim() ? googleMapsUrl.trim() : null;
      await updateSettings.mutateAsync({
        addressLines: lines.length > 0 ? lines : undefined,
        city: city.trim() ? city.trim() : null,
        state: stateVal.trim() ? stateVal.trim() : null,
        postalCode: postalCode.trim() ? postalCode.trim() : null,
        latitude: latVal,
        longitude: lngVal,
        googleMapsUrl: mapsUrlVal,
      } as unknown as Record<string, unknown> as never);
      setLocationState({ kind: 'saved' });
      toast('Location saved', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setLocationState({ kind: 'error', message: msg });
      toast(msg, 'error');
    }
  };

  const handleSaveHours = async () => {
    const errs: Record<string, string> = {};
    if (hoursWeekdays.trim().length > 80) errs.hoursWeekdays = 'Keep under 80 characters.';
    if (hoursSunday.trim().length > 80) errs.hoursSunday = 'Keep under 80 characters.';
    setHoursErrors(errs);
    if (Object.keys(errs).length > 0) {
      setHoursState({ kind: 'error', message: 'Fix the highlighted fields.' });
      return;
    }
    setHoursState({ kind: 'saving' });
    try {
      const hoursArr: string[] = [];
      if (hoursWeekdays.trim()) hoursArr.push(hoursWeekdays.trim());
      if (hoursSunday.trim()) hoursArr.push(hoursSunday.trim());
      // Always send at least the current effective value if empty? Preserve fallback handling in repo
      await updateSettings.mutateAsync({
        hours: hoursArr.length > 0 ? hoursArr : undefined,
      });
      setHoursState({ kind: 'saved' });
      toast('Shop hours saved', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setHoursState({ kind: 'error', message: msg });
      toast(msg, 'error');
    }
  };

  const handleSaveSocial = async () => {
    const errs: Record<string, string> = {};
    const checkUrl = (v: string, key: string, label: string) => {
      const t = v.trim();
      if (t && !isValidUrl(t)) errs[key] = `${label} must be a valid https:// URL.`;
    };
    checkUrl(instagramUrl, 'instagramUrl', 'Instagram');
    checkUrl(facebookUrl, 'facebookUrl', 'Facebook');
    checkUrl(youtubeUrl, 'youtubeUrl', 'YouTube');
    setSocialErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSocialState({ kind: 'error', message: 'Fix the highlighted fields.' });
      return;
    }
    setSocialState({ kind: 'saving' });
    try {
      const toNull = (v: string) => {
        const t = v.trim();
        return t ? t : null;
      };
      await updateSettings.mutateAsync({
        instagramUrl: toNull(instagramUrl),
        facebookUrl: toNull(facebookUrl),
        youtubeUrl: toNull(youtubeUrl),
      } as unknown as Record<string, unknown> as never);
      setSocialState({ kind: 'saved' });
      toast('Social media saved', 'success');
    } catch (err) {
      const msg = errorToMessage(err);
      setSocialState({ kind: 'error', message: msg });
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

  const derivedMapsPreview =
    latitude.trim() && longitude.trim() && isValidLatitude(latitude) && isValidLongitude(longitude)
      ? `https://www.google.com/maps?q=${latitude.trim()},${longitude.trim()}`
      : googleMapsUrl.trim() || null;

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

      <Group title="Store" subtitle="Shop identity and delivery configuration">
        <Input
          label="Store name"
          value={storeName}
          error={storeErrors.storeName}
          onChange={(e) => {
            setStoreName(e.target.value);
            setStoreState({ kind: 'idle' });
            if (storeErrors.storeName) setStoreErrors((p) => ({ ...p, storeName: '' }));
          }}
          placeholder={isPending ? 'Loading…' : 'OceanFresh'}
          disabled={isPending}
        />
        <Input
          label="Tagline"
          value={tagline}
          error={storeErrors.tagline}
          hint="Shown under store name on contact and footer"
          onChange={(e) => {
            setTagline(e.target.value);
            setStoreState({ kind: 'idle' });
            if (storeErrors.tagline) setStoreErrors((p) => ({ ...p, tagline: '' }));
          }}
          placeholder="Fresh Seafood · Jhargram, West Bengal"
          disabled={isPending}
        />
        <Input
          label="WhatsApp number"
          value={whatsapp}
          error={storeErrors.whatsapp}
          hint="Digits only for wa.me link, e.g. 918509597935"
          onChange={(e) => {
            setWhatsapp(e.target.value);
            setStoreState({ kind: 'idle' });
            if (storeErrors.whatsapp) setStoreErrors((p) => ({ ...p, whatsapp: '' }));
          }}
          placeholder="918509597935"
          disabled={isPending}
        />
        <Input
          label="Delivery charge (₹)"
          value={deliveryFee}
          error={storeErrors.deliveryFee}
          onChange={(e) => {
            setDeliveryFee(e.target.value);
            setStoreState({ kind: 'idle' });
            if (storeErrors.deliveryFee) setStoreErrors((p) => ({ ...p, deliveryFee: '' }));
          }}
          placeholder="40"
          type="number"
          disabled={isPending}
        />
        <Input
          label="Free delivery above (₹)"
          value={freeDeliveryAbove}
          error={storeErrors.freeDeliveryAbove}
          onChange={(e) => {
            setFreeDeliveryAbove(e.target.value);
            setStoreState({ kind: 'idle' });
            if (storeErrors.freeDeliveryAbove)
              setStoreErrors((p) => ({ ...p, freeDeliveryAbove: '' }));
          }}
          placeholder="500"
          type="number"
          disabled={isPending}
        />
        <Button
          variant="primary"
          loading={storeState.kind === 'saving'}
          onClick={() => void handleSaveStore()}
          disabled={storeState.kind === 'saving'}
        >
          {storeState.kind === 'saving' ? 'Saving…' : 'Save store settings'}
        </Button>
        <SaveFeedback state={storeState} />
      </Group>

      <Group title="Contact" subtitle="Public contact information shown on storefront">
        <Input
          label="Phone (display)"
          value={phoneDisplay}
          error={contactErrors.phoneDisplay}
          hint="Shown as Call Us, e.g. +91 85095 97935"
          onChange={(e) => {
            setPhoneDisplay(e.target.value);
            setContactState({ kind: 'idle' });
            if (contactErrors.phoneDisplay) setContactErrors((p) => ({ ...p, phoneDisplay: '' }));
          }}
          placeholder="+91 85095 97935"
          disabled={isPending}
        />
        <Input
          label="Phone (dialable)"
          value={phoneRaw}
          error={contactErrors.phoneRaw}
          hint="Used for tel: link, e.g. +918509597935"
          onChange={(e) => {
            setPhoneRaw(e.target.value);
            setContactState({ kind: 'idle' });
            if (contactErrors.phoneRaw) setContactErrors((p) => ({ ...p, phoneRaw: '' }));
          }}
          placeholder="+918509597935"
          disabled={isPending}
        />
        <Input
          label="Email"
          value={email}
          error={contactErrors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setContactState({ kind: 'idle' });
            if (contactErrors.email) setContactErrors((p) => ({ ...p, email: '' }));
          }}
          placeholder="hello@oceanfresh.in"
          type="email"
          disabled={isPending}
        />
        <Button
          variant="primary"
          loading={contactState.kind === 'saving'}
          onClick={() => void handleSaveContact()}
          disabled={contactState.kind === 'saving'}
        >
          {contactState.kind === 'saving' ? 'Saving…' : 'Save contact'}
        </Button>
        <SaveFeedback state={contactState} />
      </Group>

      <Group
        title="Location"
        subtitle="Store address and Google Maps location (Phase 1: coordinates + Maps URL, no API key)"
      >
        <Input
          label="Address line 1"
          value={addressLine1}
          error={locationErrors.addressLine1}
          onChange={(e) => {
            setAddressLine1(e.target.value);
            setLocationState({ kind: 'idle' });
          }}
          placeholder="Shop No. 12, Fish Market"
          disabled={isPending}
        />
        <Input
          label="Address line 2"
          value={addressLine2}
          onChange={(e) => {
            setAddressLine2(e.target.value);
            setLocationState({ kind: 'idle' });
          }}
          placeholder="Jhargram, West Bengal"
          disabled={isPending}
        />
        <Input
          label="City"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setLocationState({ kind: 'idle' });
          }}
          placeholder="Jhargram"
          disabled={isPending}
        />
        <Input
          label="State"
          value={stateVal}
          onChange={(e) => {
            setStateVal(e.target.value);
            setLocationState({ kind: 'idle' });
          }}
          placeholder="West Bengal"
          disabled={isPending}
        />
        <Input
          label="Postal code (PIN)"
          value={postalCode}
          error={locationErrors.postalCode}
          onChange={(e) => {
            setPostalCode(e.target.value);
            setLocationState({ kind: 'idle' });
            if (locationErrors.postalCode) setLocationErrors((p) => ({ ...p, postalCode: '' }));
          }}
          placeholder="721507"
          disabled={isPending}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '16px',
            background: '#F8FAF9',
            borderRadius: 12,
            border: '1px solid rgba(11,19,15,0.06)',
          }}
        >
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#0B130F',
            }}
          >
            Store location on map
          </div>
          <Input
            label="Latitude"
            value={latitude}
            error={locationErrors.latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
              setLocationState({ kind: 'idle' });
              if (locationErrors.latitude) setLocationErrors((p) => ({ ...p, latitude: '' }));
            }}
            placeholder="22.45"
            type="text"
            disabled={isPending}
          />
          <Input
            label="Longitude"
            value={longitude}
            error={locationErrors.longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
              setLocationState({ kind: 'idle' });
              if (locationErrors.longitude) setLocationErrors((p) => ({ ...p, longitude: '' }));
            }}
            placeholder="86.98"
            type="text"
            disabled={isPending}
          />
          <Input
            label="Google Maps URL"
            value={googleMapsUrl}
            error={locationErrors.googleMapsUrl}
            hint="Leave empty to auto-generate from coordinates"
            onChange={(e) => {
              setGoogleMapsUrl(e.target.value);
              setLocationState({ kind: 'idle' });
              if (locationErrors.googleMapsUrl)
                setLocationErrors((p) => ({ ...p, googleMapsUrl: '' }));
            }}
            placeholder="https://www.google.com/maps?q=22.45,86.98"
            disabled={isPending}
          />
          {derivedMapsPreview ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '12px',
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid rgba(11,19,15,0.06)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 11,
                  color: '#6C7E75',
                  fontWeight: 600,
                }}
              >
                Preview
              </div>
              {latitude.trim() && longitude.trim() ? (
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 13,
                    color: '#0B130F',
                  }}
                >
                  Coordinates: {latitude.trim()}, {longitude.trim()}
                </div>
              ) : null}
              <a
                href={derivedMapsPreview}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 13,
                  color: '#0d2035',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  wordBreak: 'break-all',
                }}
              >
                Open in Google Maps →
              </a>
            </div>
          ) : (
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                color: '#6C7E75',
                fontStyle: 'italic',
              }}
            >
              Add coordinates or a Maps URL to show directions on the storefront.
            </div>
          )}
        </div>
        <Button
          variant="primary"
          loading={locationState.kind === 'saving'}
          onClick={() => void handleSaveLocation()}
          disabled={locationState.kind === 'saving'}
        >
          {locationState.kind === 'saving' ? 'Saving…' : 'Save location'}
        </Button>
        <SaveFeedback state={locationState} />
      </Group>

      <Group title="Shop Hours" subtitle="Displayed on the Contact page">
        <Input
          label="Weekdays (Mon–Sat)"
          value={hoursWeekdays}
          error={hoursErrors.hoursWeekdays}
          onChange={(e) => {
            setHoursWeekdays(e.target.value);
            setHoursState({ kind: 'idle' });
            if (hoursErrors.hoursWeekdays) setHoursErrors((p) => ({ ...p, hoursWeekdays: '' }));
          }}
          placeholder="Mon–Sat · 6AM – 9PM"
          disabled={isPending}
        />
        <Input
          label="Sunday"
          value={hoursSunday}
          error={hoursErrors.hoursSunday}
          onChange={(e) => {
            setHoursSunday(e.target.value);
            setHoursState({ kind: 'idle' });
            if (hoursErrors.hoursSunday) setHoursErrors((p) => ({ ...p, hoursSunday: '' }));
          }}
          placeholder="Sunday · 6AM – 2PM"
          disabled={isPending}
        />
        <Button
          variant="primary"
          loading={hoursState.kind === 'saving'}
          onClick={() => void handleSaveHours()}
          disabled={hoursState.kind === 'saving'}
        >
          {hoursState.kind === 'saving' ? 'Saving…' : 'Save hours'}
        </Button>
        <SaveFeedback state={hoursState} />
      </Group>

      <Group
        title="Social Media"
        subtitle="Only filled links appear on the storefront. Clear a field to hide its icon. WhatsApp uses the Store WhatsApp number above."
      >
        <Input
          label="Instagram URL"
          value={instagramUrl}
          error={socialErrors.instagramUrl}
          onChange={(e) => {
            setInstagramUrl(e.target.value);
            setSocialState({ kind: 'idle' });
            if (socialErrors.instagramUrl) setSocialErrors((p) => ({ ...p, instagramUrl: '' }));
          }}
          placeholder="https://www.instagram.com/yourshop"
          disabled={isPending}
        />
        <Input
          label="Facebook URL"
          value={facebookUrl}
          error={socialErrors.facebookUrl}
          onChange={(e) => {
            setFacebookUrl(e.target.value);
            setSocialState({ kind: 'idle' });
            if (socialErrors.facebookUrl) setSocialErrors((p) => ({ ...p, facebookUrl: '' }));
          }}
          placeholder="https://www.facebook.com/yourshop"
          disabled={isPending}
        />
        <Input
          label="YouTube URL"
          value={youtubeUrl}
          error={socialErrors.youtubeUrl}
          onChange={(e) => {
            setYoutubeUrl(e.target.value);
            setSocialState({ kind: 'idle' });
            if (socialErrors.youtubeUrl) setSocialErrors((p) => ({ ...p, youtubeUrl: '' }));
          }}
          placeholder="https://www.youtube.com/@yourshop"
          disabled={isPending}
        />
        <Button
          variant="primary"
          loading={socialState.kind === 'saving'}
          onClick={() => void handleSaveSocial()}
          disabled={socialState.kind === 'saving'}
        >
          {socialState.kind === 'saving' ? 'Saving…' : 'Save social links'}
        </Button>
        <SaveFeedback state={socialState} />
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
