// Fonts are loaded once in index.html via Google Fonts. The `fontFamily`
// values here are the CSS family names with weights applied separately.
export const typography = {
  display: {
    size: 34,
    lineHeight: 42,
    weight: '600' as const,
    fontFamily: 'Cormorant Garamond',
  },
  heading: {
    size: 26,
    lineHeight: 34,
    weight: '600' as const,
    fontFamily: 'Cormorant Garamond',
  },
  title: {
    size: 22,
    lineHeight: 30,
    weight: '600' as const,
    fontFamily: 'Cormorant Garamond',
  },
  body: {
    size: 16,
    lineHeight: 24,
    weight: '400' as const,
    fontFamily: 'Instrument Sans',
  },
  bodyMedium: {
    size: 16,
    lineHeight: 24,
    weight: '500' as const,
    fontFamily: 'Instrument Sans',
  },
  bodySemiBold: {
    size: 16,
    lineHeight: 24,
    weight: '600' as const,
    fontFamily: 'Instrument Sans',
  },
  label: {
    size: 13,
    lineHeight: 18,
    weight: '500' as const,
    fontFamily: 'Instrument Sans',
  },
  caption: {
    size: 12,
    lineHeight: 16,
    weight: '400' as const,
    fontFamily: 'Instrument Sans',
  },
} as const;

export type TypographyVariant = keyof typeof typography;
