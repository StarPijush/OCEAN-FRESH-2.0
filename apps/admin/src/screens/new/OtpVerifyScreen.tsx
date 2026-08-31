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
            <strong style={{ color: '#1a1d23' }}>{email || 'your email'}</strong>. Check your inbox.
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
        style={{
          borderRadius: 9999,
          padding: '14px 24px',
          fontSize: 12,
          letterSpacing: '0.12em',
          boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(74,184,193,0.18)',
        }}
        onClick={() => void handleVerify()}
      >
        Verify OTP →
      </Button>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <button
          type="button"
          className="auth-link"
          style={{ ...linkStyle, opacity: resending || countdown > 0 ? 0.5 : 1 }}
          disabled={resending || countdown > 0}
          onClick={() => void handleResend()}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </button>
        <button
          type="button"
          className="auth-link"
          style={linkStyle}
          onClick={() => navigate('/login')}
        >
          ← Back to login
        </button>
      </div>
      <p style={noteStyle}>
        Didn&apos;t receive it?{' '}
        <button
          type="button"
          className="auth-link"
          style={{ ...linkStyle, textDecoration: 'underline' } as React.CSSProperties}
          onClick={() => void handleResend()}
        >
          Resend OTP
        </button>
      </p>

      <style>{`
        .auth-link:hover {
          color: #1c1917 !important;
          text-decoration-color: rgba(28, 25, 23, 0.45) !important;
        }
      `}</style>
    </AuthLayout>
  );
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#991b1b',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderLeft: '3px solid #e07a65',
  padding: '10px 12px',
  borderRadius: 10,
  marginBottom: 8,
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '12.5px',
  fontWeight: 500,
  color: '#78716c',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  textDecorationColor: 'rgba(120,113,108,0.3)',
  textUnderlineOffset: '3px',
};

const noteStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '12px',
  color: '#78716c',
  textAlign: 'center',
  marginTop: 14,
  lineHeight: 1.6,
};
