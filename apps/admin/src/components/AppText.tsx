import type { CSSProperties, HTMLAttributes } from 'react';

import { colors, typography, type TypographyVariant } from '../theme';

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TypographyVariant;
  color?: keyof typeof colors;
  style?: CSSProperties;
  /** Clamps long text to the given number of lines with an ellipsis. */
  numberOfLines?: number;
}

export function AppText({
  variant = 'body',
  color = 'cream',
  style,
  numberOfLines,
  ...rest
}: TextProps) {
  const preset = typography[variant];
  const clamp =
    numberOfLines !== undefined
      ? {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: 'vertical' as const,
        }
      : undefined;
  return (
    <span
      {...rest}
      style={{
        fontFamily: preset.fontFamily,
        fontSize: preset.size,
        lineHeight: `${preset.lineHeight}px`,
        fontWeight: preset.weight,
        color: colors[color],
        ...clamp,
        ...style,
      }}
    />
  );
}
