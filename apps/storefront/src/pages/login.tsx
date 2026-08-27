import '../components/auth/auth.css';

import { getClient } from '@oceanfresh/supabase';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { showToast } from '../components/ui/toastController.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError('Enter email and password.');
      showToast('Enter email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await getClient().auth.signInWithPassword({
        email: trimmed,
        password,
      });
      if (err) throw err;
      showToast('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="otp-page">
      <div className="otp-wrap">
        <div className="otp-card" role="main" aria-labelledby="login-title">
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
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <p className="otp-eyebrow">Welcome back</p>
          <h1 id="login-title" className="otp-title">
            Log in
          </h1>
          <p className="otp-sub">Access your OceanFresh account.</p>

          <form className="otp-form" onSubmit={handleLogin} noValidate>
            <div className="form-field" style={{ width: '100%', marginBottom: 0 }}>
              <label className="form-label" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
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
              />
            </div>
            <div className="form-field" style={{ width: '100%', marginBottom: 0 }}>
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="Your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
                aria-required="true"
                aria-describedby={error ? 'login-error' : undefined}
                aria-invalid={Boolean(error)}
              />
            </div>
            {error ? (
              <div id="login-error" role="alert" className="otp-error-banner">
                {error}
              </div>
            ) : null}
            <button type="submit" className="otp-verify-btn" disabled={loading} aria-busy={loading}>
              <span>{loading ? 'Signing in...' : 'Log in'}</span>
            </button>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '0.74rem',
                color: 'var(--ocean)',
                fontWeight: 600,
                textDecoration: 'underline',
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              Forgot password?
            </Link>
          </form>

          <Link to="/" className="otp-back">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
