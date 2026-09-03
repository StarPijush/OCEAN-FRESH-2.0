// OceanFresh Admin — Spark Reference radius tokens (main.css:86-90)

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
  // Semantic
  card: 18,
  cardSm: 14,
  cardLg: 24,
  button: 14,
  input: 14,
  modal: 18,
  badge: 9999,
  toggle: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
