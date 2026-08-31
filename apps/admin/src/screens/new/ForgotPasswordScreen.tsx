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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@oceanfresh.in"
          type="email"
          autoCapitalize="none"
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
          onClick={() => void handleSend()}
        >
          Send OTP →
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
