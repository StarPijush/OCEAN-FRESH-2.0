import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { authErrorStyle, authLinkStyle } from '../components/auth-styles';
import { AuthCard } from '../components/AuthCard';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { resetPassword } from '../services/auth.service';
import { spacing } from '../theme';

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
      <AuthCard
        eyebrow="Set New Password"
        title="Password updated"
        subtitle="Sign in with your new password."
      >
        <Button label="Sign in →" fullWidth onPress={() => navigate('/login')} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Set New Password"
      title="New password"
      subtitle={
        email
          ? `For ${email} — choose a strong password, minimum 8 characters.`
          : 'Choose a strong password, minimum 8 characters.'
      }
    >
      <TextField
        label="New password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
      />
      <TextField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat your password"
        secureTextEntry
      />
      {error ? <div style={authErrorStyle}>{error}</div> : null}
      <Button
        label="Update password →"
        fullWidth
        loading={submitting}
        onPress={() => void handleReset()}
      />
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
