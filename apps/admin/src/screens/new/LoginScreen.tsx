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
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
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
        />
        <Input
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          secureToggle
        />
        {error ? <div style={errorStyle}>{error}</div> : null}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={submitting}
          size="lg"
          style={{ marginTop: 8 }}
        >
          Sign In →
        </Button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 4,
          }}
        >
          <button type="button" style={linkStyle} onClick={() => navigate('/forgot-password')}>
            Forgot password?
          </button>
          {STOREFRONT_URL ? (
            <button
              type="button"
              style={linkStyle}
              onClick={() => window.open(STOREFRONT_URL, '_blank', 'noopener')}
            >
              View store →
            </button>
          ) : null}
        </div>
      </form>
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
};

const linkStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-aqua)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};
