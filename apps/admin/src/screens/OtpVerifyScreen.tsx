import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { LinkButton } from '../components/LinkButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { resendEmailOtp, verifyEmailOtp } from '../services/auth.service';
import { colors, radius, spacing, typography } from '../theme';
import { maskEmail, sanitizeOtpInput } from '../utils/otp';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;

const OTP_LENGTH = 6;

export function OtpVerifyScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit passcode.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await verifyEmailOtp(email, otp);
      navigation.replace('ResetPassword', { email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That passcode is not valid.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await resendEmailOtp(email);
      setOtp('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the passcode.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <BrandMark size={56} />
        <AppText variant="title">Enter passcode</AppText>
        <AppText variant="body" color="mutedBright" style={styles.center}>
          Sent to {maskEmail(email)}. It expires in a few minutes.
        </AppText>
      </View>

      <Screen scroll={false}>
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={(v) => setOtp(sanitizeOtpInput(v, OTP_LENGTH))}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          style={styles.otpInput}
          placeholder="------"
          placeholderTextColor={colors.muted}
        />
        {error ? (
          <AppText variant="caption" color="warn" style={styles.error}>
            {error}
          </AppText>
        ) : null}
        <Button label="Verify & continue" fullWidth loading={submitting} onPress={handleVerify} />
        <View style={styles.row}>
          <LinkButton label="Resend passcode" onPress={handleResend} loading={resending} />
          <LinkButton label="Change email" onPress={() => navigation.goBack()} />
        </View>
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
    paddingBottom: spacing.xl,
  },
  center: { textAlign: 'center', paddingHorizontal: spacing.xl },
  otpInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    color: colors.cream,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 14,
    textAlign: 'center',
    fontFamily: typography.body.fontFamily,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  error: { marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
});
