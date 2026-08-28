import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { authErrorStyle, authLinkStyle } from '../components/auth-styles';
import { AuthCard } from '../components/AuthCard';
import { Button } from '../components/Button';
import { resendEmailOtp, verifyEmailOtp } from '../services/auth.service';
import { colors, spacing } from '../theme';

function OtpBoxes({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: () => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, '').slice(0, 6).split('');

  const setDigit = (idx: number, char: string) => {
    const arr = value.padEnd(6, '').split('').slice(0, 6);
    arr[idx] = char;
    const next = arr.join('').trimEnd();
    onChange(next);
    return next;
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        margin: `8px 0 ${spacing.md}px`,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digits[i] ?? ''}
          autoFocus={i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          onChange={(e) => {
            const ch = e.target.value.replace(/[^0-9]/g, '').slice(-1);
            if (!ch) {
              setDigit(i, '');
              return;
            }
            const next = setDigit(i, ch);
            if (i < 5) refs.current[i + 1]?.focus();
            if (next.replace(/\s/g, '').length === 6) onComplete();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (pasted) {
              e.preventDefault();
              onChange(pasted);
              const idx = Math.min(pasted.length, 5);
              refs.current[idx]?.focus();
              if (pasted.length === 6) onComplete();
            }
          }}
          style={{
            width: 44,
            height: 56,
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 700,
            backgroundColor: colors.surfaceAlive,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.cream,
            outline: 'none',
            transition: 'border-color 0.2s, transform 0.2s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.12)',
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = colors.aqua;
            (e.target as HTMLInputElement).style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = colors.border;
            (e.target as HTMLInputElement).style.transform = 'none';
          }}
        />
      ))}
    </div>
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
    <AuthCard
      eyebrow="Two-Step Verification"
      title="Enter OTP"
      subtitle={
        justVerified
          ? 'Passcode accepted — taking you to reset your password.'
          : `A 6-digit OTP has been sent to ${email || 'your email'}. Check your inbox.`
      }
    >
      <OtpBoxes value={code} onChange={setCode} onComplete={() => void handleVerify()} />
      {error ? <div style={authErrorStyle}>{error}</div> : null}
      <Button
        label="Verify OTP →"
        fullWidth
        loading={verifying}
        onPress={() => void handleVerify()}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: spacing.md,
        }}
      >
        <button
          type="button"
          style={{ ...authLinkStyle, opacity: resending || countdown > 0 ? 0.5 : 1 }}
          disabled={resending || countdown > 0}
          onClick={() => void handleResend()}
        >
          <AppText variant="caption" color="aqua">
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </AppText>
        </button>
        <button type="button" style={authLinkStyle} onClick={() => navigate('/login')}>
          <AppText variant="caption" color="aqua">
            ← Back to login
          </AppText>
        </button>
      </div>
    </AuthCard>
  );
}
