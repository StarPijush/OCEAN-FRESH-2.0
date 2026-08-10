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
import { resetPassword } from '../services/auth.service';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(password);
      navigation.popToTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <BrandMark size={56} />
        <AppText variant="title">Set a new password</AppText>
      </View>

      <Screen scroll={false}>
        <TextField
          label="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          textContentType="newPassword"
        />
        <TextField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="••••••••"
          secureTextEntry
          textContentType="newPassword"
        />
        {error ? (
          <AppText variant="caption" color="warn" style={styles.error}>
            {error}
          </AppText>
        ) : null}
        <Button label="Update password" fullWidth loading={submitting} onPress={handleReset} />
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
  error: { marginBottom: spacing.lg },
});
