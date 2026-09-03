// OceanFresh Admin — Spark Reference shadow tokens (restrained light)

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(11,19,15,0.04)',
  sm: '0 2px 8px rgba(11,19,15,0.02)',
  md: '0 10px 30px rgba(11,19,15,0.04)',
  lg: '0 20px 50px rgba(11,19,15,0.08)',
  xl: '0 20px 30px rgba(11,19,15,0.08), 0 8px 16px rgba(11,19,15,0.06)',
  xxl: '0 25px 50px rgba(11,19,15,0.10)',

  // Spark reference
  surface: '0 2px 8px rgba(11,19,15,0.02)',
  card: '0 10px 30px rgba(11,19,15,0.04)',
  cardHover: '0 20px 50px rgba(11,19,15,0.08)',
  elevated: '0 20px 50px rgba(11,19,15,0.08)',
  modal: '0 30px 60px rgba(11,19,15,0.12)',
  drawer: '-4px 0 20px rgba(11,19,15,0.08)',
  dropdown: '0 20px 50px rgba(11,19,15,0.08)',
  tooltip: '0 8px 24px rgba(11,19,15,0.08)',
  focus: '0 0 0 3px rgba(13,32,53,0.08)',
  focusError: '0 0 0 3px rgba(239,68,68,0.08)',
  focusSuccess: '0 0 0 3px rgba(34,197,94,0.08)',

  // Inner shadows — Spark forest RGB 11,19,15
  inner: 'inset 0 2px 4px rgba(11,19,15,0.04)',
  innerLg: 'inset 0 4px 8px rgba(11,19,15,0.06)',
} as const;

export type ShadowToken = keyof typeof shadows;
