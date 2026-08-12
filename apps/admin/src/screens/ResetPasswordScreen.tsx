import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { resetPassword } from '../services/auth.service';
import { colors, spacing } from '../theme';

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
        <AppText variant="title">{done ? 'Password updated' : 'Set a new password'}</AppText>
        <AppText
          variant="body"
          color="mutedBright"
          style={{ textAlign: 'center', padding: `0 ${spacing.xl}px` }}
        >
          {done ? 'Sign in with your new password.' : `For ${email || 'your account'}.`}
        </AppText>
      </div>

      <Screen scroll={false}>
        {done ? (
          <Button label="Sign in" fullWidth onPress={() => navigate('/login')} />
        ) : (
          <>
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
            {error ? (
              <AppText variant="caption" color="warn" style={{ marginBottom: spacing.lg }}>
                {error}
              </AppText>
            ) : null}
            <Button
              label="Update password"
              fullWidth
              loading={submitting}
              onPress={() => void handleReset()}
            />
            <Button
              label="Back to sign in"
              variant="ghost"
              fullWidth
              onPress={() => navigate('/login')}
              style={{ marginTop: spacing.md }}
            />
          </>
        )}
      </Screen>
    </div>
  );
}
