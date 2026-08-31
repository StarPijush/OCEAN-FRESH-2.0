// OceanFresh Admin — Reference-aligned typography tokens
// Fonts: Cormorant Garamond (display) + Instrument Sans (UI)
// Reference scale adjusted from existing

export const typography = {
  // Display / Hero (Cormorant Garamond)
  display: {
    size: 48,
    lineHeight: 1.1,
    weight: '300' as const,
    letterSpacing: '-0.02em',
    fontFamily: 'Cormorant Garamond, Georgia, serif',
  },
  displaySm: {
    size: 36,
    lineHeight: 1.15,
    weight: '300' as const,
    letterSpacing: '-0.01em',
    fontFamily: 'Cormorant Garamond, Georgia, serif',
  },

  // Page headings (Cormorant Garamond)
  h1: {
    size: 32,
    lineHeight: 1.2,
    weight: '300' as const,
    letterSpacing: '-0.01em',
    fontFamily: 'Cormorant Garamond, Georgia, serif',
  },
  h2: {
    size: 24,
    lineHeight: 1.25,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: 'Cormorant Garamond, Georgia, serif',
  },
  h3: {
    size: 20,
    lineHeight: 1.3,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: 'Cormorant Garamond, Georgia, serif',
  },

  // UI Text (Instrument Sans)
  bodyLg: {
    size: 16,
    lineHeight: 1.6,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: 'Instrument Sans, sans-serif',
  },
  body: {
    size: 14,
    lineHeight: 1.5,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: 'Instrument Sans, sans-serif',
  },
  bodySm: {
    size: 13,
    lineHeight: 1.5,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: 'Instrument Sans, sans-serif',
  },
  bodyXs: {
    size: 12,
    lineHeight: 1.5,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: 'Instrument Sans, sans-serif',
  },

  // Labels / Metadata
  label: {
    size: 11,
    lineHeight: 1.4,
    weight: '600' as const,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    fontFamily: 'Instrument Sans, sans-serif',
  },
  labelSm: {
    size: 10,
    lineHeight: 1.4,
    weight: '600' as const,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    fontFamily: 'Instrument Sans, sans-serif',
  },

  // Numbers / Data (tabular)
  number: {
    size: 14,
    lineHeight: 1.4,
    weight: '600' as const,
    letterSpacing: '0.02em',
    fontFamily: 'Instrument Sans, sans-serif',
    fontVariantNumeric: 'tabular-nums',
  },
  numberLg: {
    size: 28,
    lineHeight: 1.1,
    weight: '400' as const,
    letterSpacing: '-0.01em',
    fontFamily: 'Cormorant Garamond, Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  numberXl: {
    size: 40,
    lineHeight: 1,
    weight: '300' as const,
    letterSpacing: '-0.02em',
    fontFamily: 'Cormorant Garamond, Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },

  // Button
  button: {
    size: 12,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    fontFamily: 'Instrument Sans, sans-serif',
  },
  buttonSm: {
    size: 11,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: 'Instrument Sans, sans-serif',
  },
  buttonLg: {
    size: 13,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: 'Instrument Sans, sans-serif',
  },

  // Navigation
  nav: {
    size: 13,
    lineHeight: 1.5,
    weight: '500' as const,
    letterSpacing: '0',
    fontFamily: 'Instrument Sans, sans-serif',
  },

  // Caption / Helper
  caption: {
    size: 11,
    lineHeight: 1.4,
    weight: '400' as const,
    letterSpacing: '0.04em',
    fontFamily: 'Instrument Sans, sans-serif',
  },

  // Eyebrow / Category
  eyebrow: {
    size: 10,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    fontFamily: 'Instrument Sans, sans-serif',
  },
} as const;

export type TypographyVariant = keyof typeof typography;
