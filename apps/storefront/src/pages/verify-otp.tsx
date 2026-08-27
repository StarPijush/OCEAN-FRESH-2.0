import '../components/auth/auth.css';

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { OtpInputs } from '../components/auth/OtpInputs.js';
import { showToast } from '../components/ui/toastController.js';
import { resendEmailOtp, verifyEmailOtp } from '../services/auth.service.js';
import { maskEmail } from '../utils/otp.js';

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation() as { state?: { email?: string } };
  const emailFromQuery = searchParams.get('email') ?? '';
  const emailFromState = location.state?.email ?? '';
  const email = (emailFromQuery || emailFromState || '').trim();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [justVerified, setJustVerified] = useState(false);
  const verifyRef = useRef<HTMLButtonElement>(null);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  // Auto-redirect after verified
  useEffect(() => {
    if (!justVerified) return;
    const t = window.setTimeout(() => {
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 700);
    return () => window.clearTimeout(t);
  }, [justVerified, navigate, email]);

  // If no email, warn
  useEffect(() => {
    if (!email) {
      setError('Missing email. Please request a new code from Forgot Password.');
    }
  }, [email]);

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    if (verifying || justVerified) return;
    if (!email) {
      setError('Missing email. Go back and enter your email again.');
      showToast('Missing email');
      return;
    }
    if (code.length !== 6) {
      setError('Enter the 6-digit passcode.');
      setFieldError(true);
      showToast('Enter the 6-digit passcode.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Passcode must be 6 digits.');
      setFieldError(true);
      showToast('Passcode must be 6 digits.');
      return;
    }
    setVerifying(true);
    setError(null);
    setFieldError(false);
    try {
      await verifyEmailOtp(email, code);
      setJustVerified(true);
      showToast('Passcode accepted — redirecting...');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'That passcode was not accepted.';
      // Map supabase otp_expired
      const friendly = msg.toLowerCase().includes('expired')
        ? 'This code has expired. Request a new code.'
        : msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('otp')
          ? 'Invalid verification code. Please try again.'
          : msg;
      setError(friendly);
      setFieldError(true);
      showToast(friendly);
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resending || countdown > 0 || !email) return;
    setResending(true);
    setError(null);
    try {
      await resendEmailOtp(email);
      setCountdown(30);
      showToast('New passcode sent');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not resend the passcode.';
      setError(msg);
      showToast(msg);
    } finally {
      setResending(false);
    }
  }

  // Clear field error on change
  function onCodeChange(next: string) {
    setCode(next);
    if (fieldError) setFieldError(false);
    if (error) setError(null);
  }

  return (
    <div id="page-verify-otp" className="otp-page">
      <div className="otp-wrap">
        <div className="otp-card" role="main" aria-labelledby="otp-title">
          <div className="otp-icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 15v2" />
              <path d="M6 10V7a6 6 0 0112 0v3" />
              <rect x="5" y="10" width="14" height="9" rx="2" />
            </svg>
          </div>

          <p className="otp-eyebrow">Verification</p>
          <h1 id="otp-title" className="otp-title">
            Verification Required
          </h1>
          <p className="otp-sub">Enter the 6-digit code sent to</p>
          <p className="otp-email" aria-live="polite">
            {email ? maskEmail(email) : 'your email'}
          </p>

          <form className="otp-form" onSubmit={handleVerify} noValidate>
            <OtpInputs
              value={code}
              onChange={onCodeChange}
              onComplete={() => void handleVerify()}
              autoFocus
              hasError={fieldError}
              disabled={verifying || justVerified}
            />

            {justVerified ? (
              <div
                role="status"
                aria-live="polite"
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--aqua)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                Passcode accepted — taking you to reset your password.
              </div>
            ) : null}

            {error ? (
              <div
                id="otp-error"
                role="alert"
                aria-live="assertive"
                className={
                  code.length === 6 || error.includes('Missing') ? 'otp-error-banner' : 'otp-error'
                }
              >
                {error}
              </div>
            ) : null}

            <button
              ref={verifyRef}
              type="submit"
              className="otp-verify-btn"
              disabled={verifying || justVerified || code.length !== 6}
              aria-busy={verifying}
              aria-disabled={verifying || justVerified || code.length !== 6}
            >
              <span>{verifying ? 'Verifying...' : justVerified ? 'Verified' : 'Verify Code'}</span>
              {!verifying && !justVerified ? (
                <svg
                  className="otp-verify-btn__arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h12" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              ) : null}
            </button>

            <div className="otp-divider" aria-hidden="true">
              <span>or</span>
            </div>

            <div className="otp-resend">
              <p className="otp-countdown" aria-live="polite" aria-atomic="true">
                {countdown > 0 ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ opacity: 0.9 }}
                    >
                      <circle cx="12" cy="12" r="8.5" />
                      <path d="M12 7.5V12l3 2" />
                    </svg>
                    <span>
                      Resend code in <strong>0:{String(countdown).padStart(2, '0')}</strong>
                    </span>
                  </>
                ) : (
                  <span>Didn&apos;t receive the code?</span>
                )}
              </p>
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={resending || countdown > 0 || !email}
                aria-busy={resending}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 4v5h.582" />
                  <path d="M20 20v-5h-.581" />
                  <path d="M4.58 9A8 8 0 0120 12" />
                  <path d="M19.42 15A8 8 0 014 12" />
                </svg>
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </form>

          <div
            style={{
              marginTop: 4,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link to="/forgot-password" className="otp-back">
              ← Back
            </Link>
            <Link to="/" className="otp-back">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
