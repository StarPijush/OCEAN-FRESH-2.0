// OceanFresh design tokens — ported verbatim from the legacy admin web
// (apps/legacy-admin-web/src/theme/*).
export const colors = {
  bg: '#0d0f12',
  surface: '#141720',
  surfaceAlive: '#1c2030',
  border: 'rgba(255, 255, 255, 0.07)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
  cream: '#f0ebe0',
  muted: '#6b7280',
  mutedBright: '#9ca3af',
  aqua: '#4ab8c1',
  aquaDim: 'rgba(74, 184, 193, 0.12)',
  warn: '#e07a65',
  warnDim: 'rgba(224, 122, 101, 0.12)',
  green: '#4ade80',
  greenDim: 'rgba(74, 222, 128, 0.12)',
  gold: '#f0b429',
  goldDim: 'rgba(240, 180, 41, 0.12)',
  white: '#ffffff',
} as const;

export type ThemeColors = typeof colors;
