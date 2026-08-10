// Fonts are loaded once in App.tsx via expo-font + @expo-google-fonts/*.
// The `fontFamily` values here are the exact registered names.
export const typography = {
  display: {
    size: 34,
    lineHeight: 42,
    weight: '600' as const,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  heading: {
    size: 26,
    lineHeight: 34,
    weight: '600' as const,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  title: {
    size: 22,
    lineHeight: 30,
    weight: '600' as const,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  body: {
    size: 16,
    lineHeight: 24,
    weight: '400' as const,
    fontFamily: 'InstrumentSans_400Regular',
  },
  bodyMedium: {
    size: 16,
    lineHeight: 24,
    weight: '500' as const,
    fontFamily: 'InstrumentSans_500Medium',
  },
  bodySemiBold: {
    size: 16,
    lineHeight: 24,
    weight: '600' as const,
    fontFamily: 'InstrumentSans_600SemiBold',
  },
  label: {
    size: 13,
    lineHeight: 18,
    weight: '500' as const,
    fontFamily: 'InstrumentSans_500Medium',
  },
  caption: {
    size: 12,
    lineHeight: 16,
    weight: '400' as const,
    fontFamily: 'InstrumentSans_400Regular',
  },
} as const;

export type TypographyVariant = keyof typeof typography;
