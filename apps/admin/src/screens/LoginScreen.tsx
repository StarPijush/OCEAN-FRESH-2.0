import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { authErrorStyle, authLinkStyle } from '../components/auth-styles';
import { AuthCard } from '../components/AuthCard';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { STOREFRONT_URL } from '../env';
import { getAuthProvider } from '../services/auth.service';
import { spacing } from '../theme';

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
    <AuthCard
      eyebrow="Admin Panel · Secure Login"
      title="Welcome back"
      subtitle="Sign in with your registered email and password."
    >
      <form
        style={{ display: 'flex', flexDirection: 'column' }}
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
        {error ? <div style={authErrorStyle}>{error}</div> : null}
        <Button
          label="Sign in"
          fullWidth
          loading={submitting}
          onPress={handleLogin}
          style={{ marginTop: spacing.sm }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.md,
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <button type="button" style={authLinkStyle} onClick={() => navigate('/forgot-password')}>
            <AppText variant="caption" color="aqua">
              Forgot password?
            </AppText>
          </button>
          {STOREFRONT_URL ? (
            <button
              type="button"
              style={authLinkStyle}
              onClick={() => window.open(STOREFRONT_URL, '_blank', 'noopener')}
            >
              <AppText variant="caption" color="aqua">
                View store →
              </AppText>
            </button>
          ) : null}
        </div>
      </form>
    </AuthCard>
  );
}
