import '../components/auth/auth.css';

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { showToast } from '../components/ui/toastController.js';
import { resetPassword } from '../services/auth.service.js';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!email) {
      // No email param but OTP session may still be valid (Supabase verified session). Allow but warn.
    }
  }, [email]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError('Enter a new password.');
      showToast('Enter a new password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      showToast('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      showToast('Passwords do not match.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await resetPassword(password);
      setDone(true);
      showToast('Password updated — please log in');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not update password.';
      setError(msg);
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="otp-page">
        <div className="otp-wrap">
          <div className="otp-card" style={{ textAlign: 'center' }}>
            <div
              className="otp-icon"
              style={{ background: 'var(--aqua)', color: 'var(--deep)' }}
              aria-hidden="true"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h1 className="otp-title">Password updated</h1>
            <p className="otp-sub">
              Your password has been reset. You can now log in with your new password.
            </p>
            <button
              type="button"
              className="otp-verify-btn"
              onClick={() => navigate('/login')}
              style={{ marginTop: 8 }}
            >
              <span>Go to login</span>
            </button>
            <Link to="/" className="otp-back" style={{ marginTop: 8 }}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-page">
      <div className="otp-wrap">
        <div className="otp-card" role="main" aria-labelledby="reset-title">
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
              <path d="M12 15v2" />
              <path d="M6 10V7a6 6 0 0112 0v3" />
              <rect x="5" y="10" width="14" height="9" rx="2" />
            </svg>
          </div>
          <p className="otp-eyebrow">Secure update</p>
          <h1 id="reset-title" className="otp-title">
            Reset Password
          </h1>
          <p className="otp-sub">Choose a new password for {email ? email : 'your account'}.</p>

          <form className="otp-form" onSubmit={handleReset} noValidate>
            <div className="form-field" style={{ width: '100%', marginBottom: 0 }}>
              <label className="form-label" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
              />
            </div>
            <div className="form-field" style={{ width: '100%', marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="form-control"
                placeholder="Repeat new password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (error) setError(null);
                }}
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'reset-error' : undefined}
              />
            </div>
            {error ? (
              <div id="reset-error" role="alert" className="otp-error-banner">
                {error}
              </div>
            ) : null}
            <button type="submit" className="otp-verify-btn" disabled={saving} aria-busy={saving}>
              <span>{saving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>

          <Link to="/login" className="otp-back">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
