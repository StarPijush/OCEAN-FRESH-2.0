import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../../components/auth/new/AuthLayout';
import { OtpInput } from '../../components/auth/new/OtpInput';
import { Button } from '../../components/ui/new/Button';
import { resendEmailOtp, verifyEmailOtp } from '../../services/auth.service';

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
    const t = setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 700);
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
    <AuthLayout
      eyebrow="Two-Step Verification"
      title="Enter OTP"
      subtitle={
        justVerified ? (
          <>Passcode accepted — taking you to reset your password.</>
        ) : (
          <>
            A 6-digit OTP has been sent to{' '}
            <strong style={{ color: 'var(--color-cream)' }}>{email || 'your email'}</strong>. Check
            your inbox.
          </>
        )
      }
    >
      <OtpInput value={code} onChange={setCode} onComplete={() => void handleVerify()} />
      {error ? <div style={errorStyle}>{error}</div> : null}
      <Button
        variant="primary"
        fullWidth
        loading={verifying}
        size="lg"
        onClick={() => void handleVerify()}
      >
        Verify OTP →
      </Button>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <button
          type="button"
          style={{ ...linkStyle, opacity: resending || countdown > 0 ? 0.5 : 1 }}
          disabled={resending || countdown > 0}
          onClick={() => void handleResend()}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </button>
        <button type="button" style={linkStyle} onClick={() => navigate('/login')}>
          ← Back to login
        </button>
      </div>
      <p style={noteStyle}>
        Didn&apos;t receive it?{' '}
        <span style={linkStyle} onClick={() => void handleResend()}>
          Resend OTP
        </span>
      </p>
    </AuthLayout>
  );
}

const errorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-warn)',
  background: 'var(--color-warn-dim)',
  borderLeft: '2px solid var(--color-warn)',
  padding: '10px 12px',
  borderRadius: 2,
  marginBottom: 8,
};

const linkStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-aqua)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const noteStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--color-muted2)',
  textAlign: 'center',
  marginTop: 12,
  lineHeight: 1.6,
};
