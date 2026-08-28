import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { authErrorStyle, authLinkStyle } from '../components/auth-styles';
import { AuthCard } from '../components/AuthCard';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { sendEmailOtp } from '../services/auth.service';
import { spacing } from '../theme';

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
    <AuthCard
      eyebrow="Password Recovery"
      title="Reset password"
      subtitle="Enter your registered email to receive a one-time passcode."
    >
      <TextField
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        placeholder="admin@oceanfresh.in"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      {error ? <div style={authErrorStyle}>{error}</div> : null}
      <Button label="Send OTP →" fullWidth loading={submitting} onPress={() => void handleSend()} />
      <div style={{ textAlign: 'center', marginTop: spacing.md }}>
        <button type="button" style={authLinkStyle} onClick={() => navigate('/login')}>
          <AppText variant="caption" color="aqua">
            ← Back to login
          </AppText>
        </button>
      </div>
    </AuthCard>
  );
}
