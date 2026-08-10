import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '../theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: keyof typeof colors;
}

export function AppText({ variant = 'body', color = 'cream', style, ...rest }: TextProps) {
  const preset = typography[variant];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: preset.fontFamily,
          fontSize: preset.size,
          lineHeight: preset.lineHeight,
          fontWeight: preset.weight,
          color: colors[color],
        },
        style,
      ]}
    />
  );
}
