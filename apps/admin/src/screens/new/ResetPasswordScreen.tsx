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
            borderRadius: 9999,
            padding: '14px 24px',
            fontSize: 12,
            letterSpacing: '0.12em',
            boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(74,184,193,0.18)',
          }}
          onClick={() => navigate('/login')}
        >
          Sign in →
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
            For <strong style={{ color: '#1a1d23' }}>{email}</strong> — choose a strong password,
            minimum 8 characters.
          </>
        ) : (
          <>Choose a strong password, minimum 8 characters.</>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            borderRadius: 9999,
            padding: '14px 24px',
            fontSize: 12,
            letterSpacing: '0.12em',
            boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(74,184,193,0.18)',
          }}
          onClick={() => void handleReset()}
        >
          Update password →
        </Button>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
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
} as React.CSSProperties;
