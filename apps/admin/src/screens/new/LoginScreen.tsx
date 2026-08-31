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
    <AuthLayout eyebrow="Admin Panel · Secure Login">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <Input
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            marginTop: 10,
            borderRadius: 6,
            padding: '15px 24px',
            fontSize: 12,
            letterSpacing: '0.14em',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(39,195,200,0.18), 0 1px 3px rgba(7,21,38,0.25)',
          }}
        >
          SIGN IN
        </Button>
        <div
          className="auth-actions"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginTop: 18,
            padding: '0 2px',
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
          color: var(--color-text-primary, #f2eee6) !important;
          text-decoration-color: rgba(242,238,230,0.45) !important;
        }
        .auth-link:active {
          color: var(--color-champagne, #d8c7a6) !important;
        }
        @media (max-width: 360px) {
          .auth-link {
            font-size: 12px !important;
          }
          .auth-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .auth-actions .auth-link {
            text-align: center;
            padding: 4px 0 !important;
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
  color: '#fecaca',
  background: 'rgba(224,122,101,0.10)',
  border: '1px solid rgba(224,122,101,0.28)',
  borderLeft: '3px solid var(--color-warn, #e07a65)',
  padding: '10px 12px',
  borderRadius: 8,
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '12.5px',
  fontWeight: 500,
  color: '#aeb9c8',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  textDecorationColor: 'rgba(174,185,200,0.32)',
  textUnderlineOffset: '3px',
  transition: 'color 150ms var(--ease-out), text-decoration-color 150ms var(--ease-out)',
} as React.CSSProperties;
