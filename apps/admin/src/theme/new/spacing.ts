// OceanFresh Admin — Reference-aligned spacing tokens
// Based on 4px base unit from reference

export const spacing = {
  // Base unit: 4px
  base: 4,
  xs: 4, // 1x
  sm: 8, // 2x
  md: 12, // 3x
  lg: 16, // 4x
  xl: 20, // 5x
  xxl: 24, // 6x
  xxxl: 32, // 8x
  xxxxl: 48, // 12x
  // Additional reference-specific
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space12: 48,
  space16: 64,
} as const;

export type SpacingToken = keyof typeof spacing;
