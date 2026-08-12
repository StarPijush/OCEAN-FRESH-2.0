import type { CSSProperties, HTMLAttributes } from 'react';

import { colors, radius, shadows } from '../theme';

export function Card({
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { style?: CSSProperties }) {
  return (
    <div
      {...rest}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.border,
        padding: 16,
        boxShadow: `0 4px 12px rgba(0, 0, 0, ${shadows.card.shadowOpacity})`,
        ...style,
      }}
    />
  );
}
