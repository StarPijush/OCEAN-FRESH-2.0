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
        <Button variant="primary" fullWidth size="lg" onClick={() => navigate('/login')}>
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
          <>For {email} — choose a strong password, minimum 8 characters.</>
        ) : (
          <>Choose a strong password, minimum 8 characters.</>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          type="password"
          secureToggle
        />
        <Input
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
          type="password"
          secureToggle
        />
        {error ? <div style={errorStyle}>{error}</div> : null}
        <Button
          variant="primary"
          fullWidth
          loading={submitting}
          size="lg"
          onClick={() => void handleReset()}
        >
          Update password →
        </Button>
        <div style={{ textAlign: 'center' }}>
          <button type="button" style={linkStyle} onClick={() => navigate('/login')}>
            ← Back to login
          </button>
        </div>
      </div>
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
};
