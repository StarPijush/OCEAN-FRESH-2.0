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
    <AuthLayout eyebrow="Password Recovery" subtitle="Enter your registered email to continue.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
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
          onClick={() => void handleSend()}
        >
          SEND OTP
        </Button>
        <Button
          variant="ghost"
          fullWidth
          size="lg"
          style={{
            borderRadius: 14,
            padding: '14px 24px',
            fontSize: 13,
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
          onClick={() => navigate('/login')}
        >
          Back to login
        </Button>
      </div>
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
