import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isPrimary = variant === 'primary';
  const isLink = variant === 'link';
  const tone = isLink ? 'aqua' : isPrimary ? 'white' : 'aqua';
  const resolvedStyle: StyleProp<ViewStyle> =
    typeof style === 'function' ? undefined : (style as StyleProp<ViewStyle>);

  return (
    <Pressable
      {...rest}
      disabled={disabled ?? loading}
      onPressIn={(e) => {
        setPressed(true);
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        rest.onPressOut?.(e);
      }}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        isLink && styles.link,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        resolvedStyle,
      ]}
    >
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator size="small" color={isPrimary ? colors.white : colors.aqua} />
          <AppText variant="label" color={tone === 'white' ? 'white' : 'aqua'}>
            {label}
          </AppText>
        </View>
      ) : (
        <AppText variant="label" color={tone}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: { backgroundColor: colors.aqua },
  secondary: { backgroundColor: colors.aquaDim, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  danger: { backgroundColor: colors.warnDim, borderWidth: 1, borderColor: colors.borderStrong },
  link: { paddingVertical: spacing.sm, paddingHorizontal: 0 },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.75 },
});
