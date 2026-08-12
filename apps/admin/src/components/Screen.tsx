import type { CSSProperties, ReactNode } from 'react';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  style?: CSSProperties;
}

export function Screen({ title, subtitle, children, scroll = true, style }: ScreenProps) {
  const header = title ? (
    <div
      style={{
        gap: spacing.xs,
        marginBottom: spacing.sm,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppText variant="display">{title}</AppText>
      {subtitle ? (
        <AppText variant="body" color="mutedBright">
          {subtitle}
        </AppText>
      ) : null}
    </div>
  ) : null;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        padding: `${spacing.lg}px`,
        paddingBottom: spacing.xxxl,
        ...style,
      }}
    >
      {header}
      {children}
    </div>
  );

  if (!scroll)
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {content}
      </div>
    );

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {content}
    </div>
  );
}
