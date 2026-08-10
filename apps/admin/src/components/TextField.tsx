import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { AppText } from './AppText';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function TextField({ label, error, hint, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="label" color="mutedBright" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        {...rest}
        placeholderTextColor={colors.muted}
        selectionColor={colors.aqua}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? (
        <AppText variant="caption" color="warn" style={styles.help}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="muted" style={styles.help}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, marginBottom: spacing.lg },
  label: { marginLeft: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.cream,
    fontSize: typography.body.size,
    fontFamily: typography.body.fontFamily,
  },
  inputError: { borderColor: colors.warn },
  help: { marginLeft: spacing.xs },
});
