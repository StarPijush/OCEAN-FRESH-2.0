import '../components/auth/auth.css';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { showToast } from '../components/ui/toastController.js';
import { sendEmailOtp } from '../services/auth.service.js';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      showToast('Enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      showToast('Enter a valid email address.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendEmailOtp(trimmed);
      showToast('Passcode sent — check your inbox');
      navigate(`/verify-otp?email=${encodeURIComponent(trimmed)}`, { state: { email: trimmed } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send passcode.';
      setError(msg);
      showToast(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="otp-page">
      <div className="otp-wrap">
        <div className="otp-card" role="main" aria-labelledby="forgot-title">
          <div className="otp-icon" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4h16v12H4z" />
              <path d="M4 4l8 7 8-7" />
            </svg>
          </div>
          <p className="otp-eyebrow">Recover access</p>
          <h1 id="forgot-title" className="otp-title">
            Forgot Password
          </h1>
          <p className="otp-sub">
            Enter your registered email and we&apos;ll send you a 6-digit passcode.
          </p>

          <form className="otp-form" onSubmit={handleSend} noValidate>
            <div className="form-field" style={{ width: '100%', marginBottom: 0 }}>
              <label className="form-label" htmlFor="forgot-email">
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'forgot-error' : undefined}
              />
            </div>
            {error ? (
              <div id="forgot-error" role="alert" className="otp-error-banner">
                {error}
              </div>
            ) : null}
            <button type="submit" className="otp-verify-btn" disabled={sending} aria-busy={sending}>
              <span>{sending ? 'Sending...' : 'Send Passcode'}</span>
              {!sending ? (
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
          </form>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 4,
            }}
          >
            <Link to="/login" className="otp-back">
              ← Back to login
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
