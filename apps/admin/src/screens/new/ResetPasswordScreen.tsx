import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../../components/auth/new/AuthLayout';
import { Button } from '../../components/ui/new/Button';
import { Input } from '../../components/ui/new/Input';
import { resetPassword } from '../../services/auth.service';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!password) {
      setError('Enter a new password.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset the password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthLayout
        eyebrow="Set New Password"
        title="Password updated"
        subtitle="Sign in with your new password."
      >
        <Button
          variant="primary"
          fullWidth
          size="lg"
          style={{
            borderRadius: 14,
            padding: '14px 24px',
            fontSize: 13,
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
          onClick={() => navigate('/login')}
        >
          SIGN IN
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Set New Password"
      title="New password"
      subtitle={
        email ? (
          <>
            For <strong style={{ color: '#0B130F' }}>{email}</strong> — choose a strong password,
            minimum 8 characters.
          </>
        ) : (
          <>Choose a strong password, minimum 8 characters.</>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          type="password"
          secureToggle
          appearance="light"
          size="md"
        />
        <Input
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
          type="password"
          secureToggle
          appearance="light"
          size="md"
        />
        {error ? <div style={errorStyle}>{error}</div> : null}
        <Button
          variant="primary"
          fullWidth
          loading={submitting}
          size="lg"
          style={{
            borderRadius: 14,
            padding: '14px 24px',
            fontSize: 13,
            letterSpacing: '0.08em',
            fontWeight: 700,
            marginTop: 4,
          }}
          onClick={() => void handleReset()}
        >
          UPDATE PASSWORD
        </Button>
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button
            type="button"
            className="auth-link"
            style={linkStyle}
            onClick={() => navigate('/login')}
          >
            ← Back to login
          </button>
        </div>
      </div>

      <style>{`
        .auth-link:hover {
          color: #0d2035 !important;
          text-decoration-color: rgba(13,32,53,0.22) !important;
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
};

const linkStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#6C7E75',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  textDecorationColor: 'rgba(108,126,117,0.24)',
  textUnderlineOffset: '3px',
} as React.CSSProperties;
