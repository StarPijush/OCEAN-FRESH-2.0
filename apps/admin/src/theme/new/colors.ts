// OceanFresh Admin — Reference-aligned color tokens (DARK NAVY + AQUA/TEAL ONLY)

export const colors = {
  // Core surfaces - DARK NAVY
  bg: '#071526',
  surface: '#0d2035',
  surface2: '#0f1f33',
  surface3: '#14304d',

  // Borders - AQUA/TEAL derived
  border: 'rgba(74,184,193,0.09)',
  border2: 'rgba(74,184,193,0.14)',
  borderHover: 'rgba(74,184,193,0.3)',
  borderActive: 'rgba(74,184,193,0.5)',

  // Text - NEUTRAL COOL GRAYS
  textPrimary: '#e6edf5',
  textSecondary: '#aeb9c8',
  textMuted: '#8291a5',

  // Brand - AQUA/TEAL
  aqua: '#4ab8c1',
  aquaHover: '#5bc8d1',
  aquaDim: 'rgba(74,184,193,0.12)',
  aquaGlow: 'rgba(74,184,193,0.15)',
  aquaBorder: 'rgba(74,184,193,0.3)',

  // Status - Green (teal-compatible)
  green: '#4ade80',
  greenHover: '#5ee08a',
  greenDim: 'rgba(74,222,128,0.12)',
  greenBorder: 'rgba(74,222,128,0.3)',

  // Status - Warn
  warn: '#e07a65',
  warnHover: '#e8907d',
  warnDim: 'rgba(224,122,101,0.12)',
  warnBorder: 'rgba(224,122,101,0.3)',

  // OceanFresh Premium — storefront canonical (authoritative) - NAVY/TEAL ONLY
  navyDeep: '#071526',
  navySurface: '#0d2035',
  navyDeepest: '#04101d',
  teal: '#27c3c8',
  tealHover: '#1faaae',
  tealDim: 'rgba(39,195,200,0.10)',
  tealGlow: 'rgba(39,195,200,0.15)',
  tealBorder: 'rgba(39,195,200,0.30)',
  gridDark: 'rgba(39,195,200,0.055)',
  gridLight: 'rgba(7,21,38,0.035)',

  // Text legacy - replaced with cool neutrals
  textHeading: '#e6edf5',
  textLightPrimary: '#071526',
  textLightSecondary: '#52657d',
  textLightAccent: '#159ea5',

  // Status legacy
  success: '#4ade80',
  successDim: 'rgba(74,222,128,0.12)',
  warning: '#e07a65',
  warningDim: 'rgba(224,122,101,0.12)',
  danger: '#e07a65',
  dangerDim: 'rgba(224,122,101,0.10)',
  info: '#4ab8c1',
  infoDim: 'rgba(74,184,193,0.10)',

  // Admin shell aliases (new - reference aligned)
  ink: '#071526',
  slate: '#9ca3af',
} as const;

export type ThemeColors = typeof colors;
