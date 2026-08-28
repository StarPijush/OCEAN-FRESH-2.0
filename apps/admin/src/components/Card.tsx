import type { CSSProperties, HTMLAttributes } from 'react';

import { colors, radius } from '../theme';

export function Card({
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { style?: CSSProperties }) {
  return (
    <div
      {...rest}
      className={`of-card ${rest.className ?? ''}`.trim()}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.border,
        padding: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        ...style,
      }}
    />
  );
}
