import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { sendEmailOtp } from '../services/auth.service';
import { colors, spacing } from '../theme';

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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: spacing.sm,
          paddingTop: spacing.xxl,
          paddingBottom: spacing.xxl,
        }}
      >
        <BrandMark size={56} />
        <AppText variant="title">Recover password</AppText>
        <AppText
          variant="body"
          color="mutedBright"
          style={{ textAlign: 'center', padding: `0 ${spacing.xl}px` }}
        >
          Enter your email — we will send a one-time passcode.
        </AppText>
      </div>

      <Screen scroll={false}>
        <TextField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@oceanfresh.in"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        {error ? (
          <AppText variant="caption" color="warn" style={{ marginBottom: spacing.lg }}>
            {error}
          </AppText>
        ) : null}
        <Button
          label="Send passcode"
          fullWidth
          loading={submitting}
          onPress={() => void handleSend()}
        />
        <Button
          label="Back to sign in"
          variant="ghost"
          fullWidth
          onPress={() => navigate(-1)}
          style={{ marginTop: spacing.md }}
        />
      </Screen>
    </div>
  );
}
