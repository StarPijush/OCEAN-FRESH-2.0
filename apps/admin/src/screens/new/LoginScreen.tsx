import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthLayout } from '../../components/auth/new/AuthLayout';
import { Button } from '../../components/ui/new/Button';
import { Input } from '../../components/ui/new/Input';
import { STOREFRONT_URL } from '../../env';
import { getAuthProvider } from '../../services/auth.service';

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await getAuthProvider().login({ email: trimmed, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Admin Panel · Secure Login"
      title="Welcome back"
      subtitle="Sign in with your registered email and password."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <Input
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@oceanfresh.in"
          autoCapitalize="none"
          autoCorrect="off"
          type="email"
          autoComplete="username"
          appearance="light"
          size="md"
        />
        <Input
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          secureToggle
          appearance="light"
          size="md"
        />
        {error ? <div style={errorStyle}>{error}</div> : null}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={submitting}
          size="lg"
          style={{
            marginTop: 6,
            borderRadius: 9999,
            padding: '14px 24px',
            fontSize: 12,
            letterSpacing: '0.12em',
            boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(74,184,193,0.18)',
          }}
        >
          Sign In →
        </Button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 6,
          }}
        >
          <button
            type="button"
            className="auth-link"
            style={linkStyle}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </button>
          {STOREFRONT_URL ? (
            <button
              type="button"
              className="auth-link"
              style={linkStyle}
              onClick={() => window.open(STOREFRONT_URL, '_blank', 'noopener')}
            >
              View store →
            </button>
          ) : null}
        </div>
      </form>

      <style>{`
        .auth-link:hover {
          color: #1c1917 !important;
          text-decoration-color: rgba(28, 25, 23, 0.45) !important;
        }
        .auth-link:active {
          color: #0f172a !important;
        }
        @media (max-width: 360px) {
          .auth-link {
            font-size: 12px !important;
          }
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
  transition: 'color 150ms var(--ease-out), text-decoration-color 150ms var(--ease-out)',
} as React.CSSProperties;
