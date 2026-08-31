// OceanFresh Admin — Reference-aligned radius tokens

export const radius = {
  none: 0,
  xs: 2,
  sm: 3,
  md: 4,
  lg: 8,
  xl: 12,
  xxl: 16,
  full: 9999,
  // Reference specific
  card: 4,
  button: 3,
  input: 3,
  modal: 4,
  badge: 20,
  toggle: 20,
} as const;

export type RadiusToken = keyof typeof radius;
