import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';

interface LinkButtonProps extends PressableProps {
  label: string;
  variant?: 'aqua' | 'muted';
  loading?: boolean;
}

export function LinkButton({
  label,
  variant = 'aqua',
  loading = false,
  style,
  ...rest
}: LinkButtonProps) {
  const resolvedStyle: StyleProp<ViewStyle> =
    typeof style === 'function' ? undefined : (style as StyleProp<ViewStyle>);

  return (
    <Pressable
      {...rest}
      disabled={rest.disabled ?? loading}
      hitSlop={8}
      style={[styles.link, resolvedStyle]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'aqua' ? colors.aqua : colors.mutedBright}
        />
      ) : (
        <AppText variant="label" color={variant === 'aqua' ? 'aqua' : 'mutedBright'}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { paddingVertical: spacing.sm },
});
