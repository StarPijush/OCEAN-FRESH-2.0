import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { LinkButton } from '../components/LinkButton';
import { TextField } from '../components/TextField';
import { STOREFRONT_URL } from '../env';
import type { RootStackParamList } from '../navigation/types';
import { getAuthProvider } from '../services/auth.service';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
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
      // RootNavigator reacts to the session change.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <BrandMark size={72} />
        <AppText variant="display" style={styles.title}>
          OceanFresh Admin
        </AppText>
        <AppText variant="body" color="mutedBright" style={styles.subtitle}>
          Manage your store from anywhere.
        </AppText>
      </View>

      <View style={styles.form}>
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
          <AppText variant="caption" color="warn" style={styles.error}>
            {error}
          </AppText>
        ) : null}
        <Button label="Sign in" fullWidth loading={submitting} onPress={handleLogin} />
        <View style={styles.links}>
          <LinkButton
            label="Forgot password?"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
          <LinkButton
            label="Open storefront"
            onPress={() => {
              if (STOREFRONT_URL) Linking.openURL(STOREFRONT_URL);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  brand: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  title: { fontFamily: typography.display.fontFamily },
  subtitle: { textAlign: 'center' },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  error: { marginBottom: spacing.lg },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
});
