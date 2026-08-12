import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { LinkButton } from '../components/LinkButton';
import { Screen } from '../components/Screen';
import { resendEmailOtp, verifyEmailOtp } from '../services/auth.service';
import { colors, spacing } from '../theme';

function OtpInput({
  value,
  autoFocus,
  onDigitChange,
  onSubmit,
}: {
  value: string;
  autoFocus?: boolean;
  onDigitChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={ref}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        onDigitChange(digits);
        if (digits.length === 6) onSubmit();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Backspace' && value.length === 0) {
          onDigitChange('');
        }
      }}
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-label="6-digit passcode"
      placeholder="••••••"
      style={{
        width: '100%',
        textAlign: 'center',
        letterSpacing: spacing.lg * 1.4,
        fontSize: 28,
        fontWeight: '600',
        padding: `${spacing.md}px ${spacing.lg}px`,
        borderRadius: 12,
        border: `1px solid ${colors.borderStrong}`,
        backgroundColor: colors.surface,
        color: colors.cream,
        fontFamily: 'inherit',
      }}
    />
  );
}

export function OtpVerifyScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [justVerified, setJustVerified] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (!justVerified) return;
    const t = setTimeout(() => {
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 700);
    return () => clearTimeout(t);
  }, [justVerified, navigate, email]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Enter the 6-digit passcode.');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await verifyEmailOtp(email, code);
      setJustVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That passcode was not accepted.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await resendEmailOtp(email);
      setCountdown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the passcode.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: spacing.sm,
          paddingTop: spacing.xxl,
          paddingBottom: spacing.xxl,
        }}
      >
        <BrandMark size={56} />
        <AppText variant="title">Enter passcode</AppText>
        <AppText
          variant="body"
          color="mutedBright"
          style={{ textAlign: 'center', padding: `0 ${spacing.xl}px` }}
        >
          {justVerified
            ? 'Passcode accepted — taking you to reset your password.'
            : `We sent a 6-digit passcode to ${email || 'your email'}.`}
        </AppText>
      </div>

      <Screen scroll={false}>
        <OtpInput
          value={code}
          autoFocus
          onDigitChange={setCode}
          onSubmit={() => void handleVerify()}
        />
        {error ? (
          <AppText variant="caption" color="warn" style={{ marginBottom: spacing.lg }}>
            {error}
          </AppText>
        ) : null}
        <Button label="Verify" fullWidth loading={verifying} onPress={() => void handleVerify()} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.xl,
          }}
        >
          <LinkButton
            label={countdown > 0 ? `Resend in ${countdown}s` : 'Resend passcode'}
            disabled={resending || countdown > 0}
            loading={resending}
            onPress={() => void handleResend()}
          />
          <LinkButton label="Back" onPress={() => navigate('/forgot-password')} />
        </div>
      </Screen>
    </div>
  );
}
