// OceanFresh premium 10/10 — centralized semantic tokens (spec 26)
// Read from CSS variables where possible; TS constants mirror admin.css
export const colors = {
  bg: '#071426',
  surface: '#0d1c30', // surface-1
  surface2: '#12243a',
  surface3: '#172d46',
  surfaceAlive: '#12243a', // elevated hover
  sidebar: '#09182a',
  border: '#1d344d',
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(33,200,200,0.25)',
  borderActive: 'rgba(33,200,200,0.45)',

  ink: '#06121f',
  cream: '#f4f7fa', // primary text
  sand: '#b6c2d0',
  muted: '#718096',
  mutedBright: '#b6c2d0', // secondary
  disabled: '#4f6072',

  aqua: '#21c8c8', // Ocean Teal
  aquaHover: '#1eb3b3',
  aquaDim: 'rgba(33,200,200,0.10)',
  aquaGlow: 'rgba(33,200,200,0.12)',

  warn: '#ef4444', // error/coral
  warnDim: 'rgba(239,68,68,0.10)',
  green: '#22c55e', // success
  greenDim: 'rgba(34,197,94,0.10)',
  gold: '#f5a524', // warning amber
  goldDim: 'rgba(245,165,36,0.10)',
  info: '#38bdf8',
  infoDim: 'rgba(56,189,248,0.10)',
  white: '#ffffff',
} as const;

export type ThemeColors = typeof colors;
