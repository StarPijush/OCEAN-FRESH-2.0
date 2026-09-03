// OceanFresh Admin — Spark Reference LIGHT system (canvas #F4F6F5, white surfaces) + OceanFresh navy brand

export const colors = {
  // Core surfaces - LIGHT (Spark canvas)
  bg: '#F4F6F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F8FAF9',
  surface2: '#F8FAF9',
  surface3: '#EEF2F0',

  // Borders - Spark light (subtle gray/green) + legacy navy for dark shell
  border: 'rgba(11,19,15,0.06)',
  border2: 'rgba(11,19,15,0.08)',
  borderHover: 'rgba(11,19,15,0.12)',
  borderActive: 'rgba(13,32,53,0.18)',

  // Text - Spark dark on light
  textPrimary: '#0B130F',
  textSecondary: '#6C7E75',
  textMuted: '#879A91',

  // Brand - AQUA/TEAL (Spark lime → OceanFresh aqua)
  aqua: '#4ab8c1',
  aquaHover: '#5bc8d1',
  aquaDim: 'rgba(74,184,193,0.08)',
  aquaGlow: 'rgba(74,184,193,0.12)',
  aquaBorder: 'rgba(74,184,193,0.18)',

  // Status - Spark system (must match CSS)
  green: '#22C55E',
  greenHover: '#16a34a',
  greenDim: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.14)',
  successDim: 'rgba(34,197,94,0.08)',

  // Status - Warn / Danger Spark red
  warn: '#EF4444',
  warnHover: '#dc2626',
  warnDim: 'rgba(239,68,68,0.08)',
  warnBorder: 'rgba(239,68,68,0.14)',
  warning: '#F97316',
  warningDim: 'rgba(249,115,22,0.08)',

  // OceanFresh Premium — navy preserved for dark chrome only
  navyDeep: '#071526',
  navySurface: '#0d2035',
  navyDeepest: '#04101d',
  navyBorder: 'rgba(255,255,255,0.08)',
  navyBorderStrong: 'rgba(255,255,255,0.1)',
  navyHover: 'rgba(255,255,255,0.04)',
  navyActive: 'rgba(74,184,193,0.08)',
  teal: '#4ab8c1',
  tealHover: '#5bc8d1',
  tealDim: 'rgba(74,184,193,0.08)',
  tealGlow: 'rgba(74,184,193,0.12)',
  tealBorder: 'rgba(74,184,193,0.18)',
  gridDark: 'rgba(11,19,15,0.06)',
  gridLight: 'rgba(11,19,15,0.02)',

  // Text
  textHeading: '#0B130F',
  textLightPrimary: '#0B130F',
  textLightSecondary: '#6C7E75',
  textLightAccent: '#4ab8c1',

  // Status legacy aliases
  success: '#22C55E',
  danger: '#EF4444',
  dangerDim: 'rgba(239,68,68,0.08)',
  info: '#4ab8c1',
  infoDim: 'rgba(74,184,193,0.10)',

  // Admin shell aliases (new - reference aligned)
  ink: '#071526',
  slate: '#9ca3af',
} as const;

export type ThemeColors = typeof colors;
