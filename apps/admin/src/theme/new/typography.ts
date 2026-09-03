// OceanFresh Admin — Spark Reference typography (Plus Jakarta Sans primary; Cormorant kept for wordmark only)

export const typography = {
  // Display / Hero — Spark uses Plus Jakarta Sans bold
  display: {
    size: 48,
    lineHeight: 1.1,
    weight: '700' as const,
    letterSpacing: '-0.025em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  displaySm: {
    size: 36,
    lineHeight: 1.15,
    weight: '700' as const,
    letterSpacing: '-0.025em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },

  // Page headings — Spark 700 -0.025em
  h1: {
    size: 28,
    lineHeight: 1.2,
    weight: '700' as const,
    letterSpacing: '-0.025em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  h2: {
    size: 18,
    lineHeight: 1.25,
    weight: '700' as const,
    letterSpacing: '-0.025em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  h3: {
    size: 16,
    lineHeight: 1.3,
    weight: '700' as const,
    letterSpacing: '-0.02em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },

  // UI Text — Spark: Plus Jakarta Sans (weight 500 / -0.01em)
  bodyLg: {
    size: 16,
    lineHeight: 1.6,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  body: {
    size: 14,
    lineHeight: 1.5,
    weight: '400' as const,
    letterSpacing: '-0.01em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  bodySm: {
    size: 13,
    lineHeight: 1.5,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  bodyXs: {
    size: 12,
    lineHeight: 1.5,
    weight: '400' as const,
    letterSpacing: '0',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },

  // Labels / Metadata — Spark 0.12-0.18em
  label: {
    size: 11,
    lineHeight: 1.4,
    weight: '600' as const,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  labelSm: {
    size: 10,
    lineHeight: 1.4,
    weight: '600' as const,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },

  // Numbers / Data (tabular) — Spark Plus Jakarta 600-800 -0.03
  number: {
    size: 14,
    lineHeight: 1.4,
    weight: '600' as const,
    letterSpacing: '0.02em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
    fontVariantNumeric: 'tabular-nums',
  },
  numberLg: {
    size: 28,
    lineHeight: 1.1,
    weight: '700' as const,
    letterSpacing: '-0.025em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
    fontVariantNumeric: 'tabular-nums',
  },
  numberXl: {
    size: 40,
    lineHeight: 1,
    weight: '800' as const,
    letterSpacing: '-0.03em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
    fontVariantNumeric: 'tabular-nums',
  },

  // Button — Spark 0.12em uppercase 600
  button: {
    size: 12,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  buttonSm: {
    size: 11,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
  buttonLg: {
    size: 13,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },

  // Navigation — Spark sidebar 0.95rem 500
  nav: {
    size: 13,
    lineHeight: 1.5,
    weight: '500' as const,
    letterSpacing: '0',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },

  // Caption / Helper
  caption: {
    size: 11,
    lineHeight: 1.4,
    weight: '400' as const,
    letterSpacing: '0.04em',
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },

  // Eyebrow / Category
  eyebrow: {
    size: 10,
    lineHeight: 1,
    weight: '600' as const,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Plus Jakarta Sans', 'Instrument Sans', sans-serif",
  },
} as const;

export type TypographyVariant = keyof typeof typography;
