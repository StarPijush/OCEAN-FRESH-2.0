import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import type { RootStackParamList } from '../navigation/types';
import { sendEmailOtp } from '../services/auth.service';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
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
      navigation.navigate('OtpVerify', { email: trimmed });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the passcode. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <BrandMark size={56} />
        <AppText variant="title">Recover password</AppText>
        <AppText variant="body" color="mutedBright" style={styles.sub}>
          Enter your email — we will send a one-time passcode.
        </AppText>
      </View>

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
          <AppText variant="caption" color="warn" style={styles.error}>
            {error}
          </AppText>
        ) : null}
        <Button label="Send passcode" fullWidth loading={submitting} onPress={handleSend} />
        <Button
          label="Back to sign in"
          variant="ghost"
          fullWidth
          onPress={() => navigation.goBack()}
          style={styles.back}
        />
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  sub: { textAlign: 'center', paddingHorizontal: spacing.xl },
  error: { marginBottom: spacing.lg },
  back: { marginTop: spacing.md },
});
