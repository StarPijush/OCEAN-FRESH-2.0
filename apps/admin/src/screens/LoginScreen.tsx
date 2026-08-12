import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { LinkButton } from '../components/LinkButton';
import { TextField } from '../components/TextField';
import { STOREFRONT_URL } from '../env';
import { getAuthProvider } from '../services/auth.service';
import { colors, spacing, typography } from '../theme';

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await getAuthProvider().login({ email: trimmed, password });
      // The session gate reacts to the session change.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
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
          gap: spacing.md,
          paddingTop: spacing.xxxl,
          paddingBottom: spacing.xxl,
        }}
      >
        <BrandMark size={72} />
        <AppText variant="display" style={{ fontFamily: typography.display.fontFamily }}>
          OceanFresh Admin
        </AppText>
        <AppText variant="body" color="mutedBright" style={{ textAlign: 'center' }}>
          Manage your store from anywhere.
        </AppText>
      </div>

      <form
        style={{
          padding: `${spacing.lg}px ${spacing.xl}px`,
          display: 'flex',
          flexDirection: 'column',
        }}
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin();
        }}
      >
        <TextField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@oceanfresh.in"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          textContentType="password"
        />
        {error ? (
          <AppText variant="caption" color="warn" style={{ marginBottom: spacing.lg }}>
            {error}
          </AppText>
        ) : null}
        <Button label="Sign in" fullWidth loading={submitting} onPress={handleLogin} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.xl,
          }}
        >
          <LinkButton label="Forgot password?" onPress={() => navigate('/forgot-password')} />
          <LinkButton
            label="Open storefront"
            onPress={() => {
              if (STOREFRONT_URL) window.open(STOREFRONT_URL, '_blank', 'noopener');
            }}
          />
        </div>
      </form>
    </div>
  );
}
