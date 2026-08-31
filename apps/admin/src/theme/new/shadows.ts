// OceanFresh Admin — Reference-aligned shadow tokens

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0,0,0,0.05)',
  sm: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
  lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  xl: '0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.04)',
  xxl: '0 25px 50px rgba(0,0,0,0.25)',

  // Reference specific shadows
  card: '0 2px 8px rgba(0,0,0,0.15)',
  cardHover: '0 4px 16px rgba(0,0,0,0.2)',
  modal: '0 20px 40px rgba(0,0,0,0.4)',
  drawer: '-4px 0 20px rgba(0,0,0,0.3)',
  dropdown: '0 8px 24px rgba(0,0,0,0.2)',
  tooltip: '0 4px 12px rgba(0,0,0,0.2)',
  focus: '0 0 0 3px rgba(74,184,193,0.4)',
  focusError: '0 0 0 3px rgba(224,122,101,0.4)',
  focusSuccess: '0 0 0 3px rgba(74,222,128,0.4)',

  // Inner shadows
  inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
  innerLg: 'inset 0 4px 8px rgba(0,0,0,0.1)',
} as const;

export type ShadowToken = keyof typeof shadows;
