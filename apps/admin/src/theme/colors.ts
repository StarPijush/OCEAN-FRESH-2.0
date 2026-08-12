// OceanFresh design tokens — admin palette mirroring the storefront
// (apps/storefront/src/styles/legacy-tokens.css).
export const colors = {
  bg: '#0a1628', // deep
  surface: '#1a3a5c', // ocean
  surfaceAlive: '#224a73', // ocean lightened (hover)
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  ink: '#0d0d0d',
  cream: '#f5f0e8',
  sand: '#e8e0d0',
  muted: '#8a8070',
  mutedBright: '#e8e0d0', // sand (secondary text on dark)
  aqua: '#4ab8c1',
  aquaDim: 'rgba(74, 184, 193, 0.14)',
  warn: '#c8513a',
  warnDim: 'rgba(200, 81, 58, 0.14)',
  green: '#4ade80',
  greenDim: 'rgba(74, 222, 128, 0.12)',
  gold: '#f0b429',
  goldDim: 'rgba(240, 180, 41, 0.12)',
  white: '#ffffff',
} as const;

export type ThemeColors = typeof colors;
