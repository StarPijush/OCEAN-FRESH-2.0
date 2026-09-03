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

  const isResendDisabled = resending || countdown > 0;
  const isVerifyDisabled = code.length !== 6 || verifying;

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
            <strong style={{ color: '#0B130F' }}>{email || 'your email'}</strong>. Check your inbox.
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
        disabled={isVerifyDisabled}
        size="lg"
        style={{
          borderRadius: 14,
          padding: '14px 24px',
          fontSize: 13,
          letterSpacing: '0.08em',
          fontWeight: 700,
        }}
        onClick={() => void handleVerify()}
      >
        VERIFY OTP
      </Button>
      <div
        className="auth-actions"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 18,
          flexWrap: 'wrap',
          gap: 16,
          padding: '0 2px',
        }}
      >
        <button
          type="button"
          className="auth-link auth-link--recovery"
          style={{ ...linkStyle, opacity: isResendDisabled ? 0.45 : 1 }}
          disabled={isResendDisabled}
          onClick={() => void handleResend()}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </button>
        <button
          type="button"
          className="auth-link auth-link--recovery"
          style={linkStyle}
          onClick={() => navigate('/login')}
        >
          Back to login
        </button>
      </div>

      <style>{`
        .auth-link--recovery,
        .auth-link--recovery:visited,
        .auth-link--recovery:hover,
        .auth-link--recovery:focus,
        .auth-link--recovery:active {
          text-decoration: none !important;
        }
        .auth-link--recovery:hover {
          color: #0d2035 !important;
        }
        .auth-link--recovery:focus-visible {
          outline: 2px solid rgba(74, 184, 193, 0.28);
          outline-offset: 3px;
          border-radius: 4px;
        }
        @media (max-width: 360px) {
          .auth-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .auth-actions .auth-link {
            text-align: center;
          }
        }
      `}</style>
    </AuthLayout>
  );
}

const errorStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#991b1b',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  padding: '10px 12px',
  borderRadius: 10,
  marginBottom: 8,
};

const linkStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#6C7E75',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px 10px',
  textDecoration: 'none',
  lineHeight: '1.4',
  transition: 'color 180ms var(--ease-out)',
};
