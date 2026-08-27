import type { CSSProperties } from 'react';

import { colors, radius, spacing } from '../theme';

export const authLinkStyle: CSSProperties = {
  display: 'inline-block',
  marginTop: spacing.md,
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: '0.75rem',
  color: colors.aqua,
};

export const authErrorStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: colors.warn,
  backgroundColor: colors.warnDim,
  borderLeft: `2px solid ${colors.warn}`,
  padding: '10px 12px',
  borderRadius: radius.sm,
  marginBottom: spacing.md,
};
