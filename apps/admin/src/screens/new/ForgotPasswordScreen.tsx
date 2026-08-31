import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthLayout } from '../../components/auth/new/AuthLayout';
import { Button } from '../../components/ui/new/Button';
import { Input } from '../../components/ui/new/Input';
import { sendEmailOtp } from '../../services/auth.service';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await sendEmailOtp(trimmed);
      navigate(`/otp-verify?email=${encodeURIComponent(trimmed)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the passcode. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Password Recovery"
      title="Reset password"
      subtitle="Enter your registered email to receive a one-time passcode."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@oceanfresh.in"
          type="email"
          autoCapitalize="none"
        />
        {error ? <div style={errorStyle}>{error}</div> : null}
        <Button
          variant="primary"
          fullWidth
          loading={submitting}
          size="lg"
          onClick={() => void handleSend()}
        >
          Send OTP →
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
