import type { CSSProperties, ReactNode } from 'react';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Rendered on the right (desktop: buttons etc.). Column-stacked on narrow screens. */
  actions?: ReactNode;
}

/** Standard screen header: title, description and optional actions. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.lg,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 200,
          gap: spacing.xs,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppText variant="display" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="body" color="mutedBright" style={{ lineHeight: '22px' }}>
            {subtitle}
          </AppText>
        ) : null}
      </div>
      {actions ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>{actions}</div>
      ) : null}
    </div>
  );
}

const styles: Record<'title', CSSProperties> = {
  title: { color: colors.cream },
};
