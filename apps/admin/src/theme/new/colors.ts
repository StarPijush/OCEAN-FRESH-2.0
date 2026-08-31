// OceanFresh Admin — Reference-aligned color tokens
// Merges reference design with OceanFresh brand DNA

export const colors = {
  // Core surfaces (from reference)
  bg: '#0d0f12',
  surface: '#141720',
  surface2: '#1c2030',
  surface3: '#23283a',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  borderHover: 'rgba(74,184,193,0.3)',
  borderActive: 'rgba(74,184,193,0.5)',

  // Text
  cream: '#f0ebe0',
  creamDim: 'rgba(240,235,224,0.7)',
  muted: '#6b7280',
  muted2: '#9ca3af',
  textPrimary: '#f0ebe0',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  // Brand - OceanFresh aqua (reference)
  aqua: '#4ab8c1',
  aquaHover: '#5bc8d1',
  aquaDim: 'rgba(74,184,193,0.12)',
  aquaGlow: 'rgba(74,184,193,0.2)',
  aquaBorder: 'rgba(74,184,193,0.3)',

  // Status colors (from reference)
  green: '#4ade80',
  greenHover: '#5ee08a',
  greenDim: 'rgba(74,222,128,0.12)',
  greenBorder: 'rgba(74,222,128,0.3)',

  warn: '#e07a65',
  warnHover: '#e8907d',
  warnDim: 'rgba(224,122,101,0.12)',
  warnBorder: 'rgba(224,122,101,0.3)',

  gold: '#f0b429',
  goldHover: '#f2c04a',
  goldDim: 'rgba(240,180,41,0.12)',
  goldBorder: 'rgba(240,180,41,0.3)',

  // Legacy OceanFresh tokens (preserved for backward compatibility during transition)
  navyDeep: '#071526',
  navySurface: '#0d2035',
  navyDeepest: '#04101d',
  champagne: '#d8c7a6',
  champagneMuted: '#9b8357',
  teal: '#27c3c8',
  tealHover: '#1faaae',
  tealDim: 'rgba(39,195,200,0.10)',
  tealGlow: 'rgba(39,195,200,0.15)',
  tealBorder: 'rgba(39,195,200,0.30)',
  ivory: '#f3f0e9',
  ivoryCard: '#f8f6f1',
  ivoryBorder: 'rgba(7,21,38,0.10)',

  // Text legacy
  textHeading: '#d8c7a6',
  textLightPrimary: '#071526',
  textLightSecondary: '#52657d',
  textLightAccent: '#159ea5',
  textLightPremium: '#9b8357',

  // Grid legacy
  gridDark: 'rgba(39,195,200,0.055)',
  gridLight: 'rgba(7,21,38,0.035)',

  // Status legacy
  success: '#22c55e',
  successDim: 'rgba(34,197,94,0.10)',
  warning: '#f5a524',
  warningDim: 'rgba(245,165,36,0.10)',
  danger: '#ef4444',
  dangerDim: 'rgba(239,68,68,0.10)',
  info: '#38bdf8',
  infoDim: 'rgba(56,189,248,0.10)',

  // Admin shell aliases (legacy - map to new)
  sidebar: '#09182a',
  disabled: '#6b7280',
  white: '#ffffff',

  // Admin shell aliases (new - reference aligned)
  ink: '#0d0f12',
  sand: '#9ca3af',
} as const;

export type ThemeColors = typeof colors;
