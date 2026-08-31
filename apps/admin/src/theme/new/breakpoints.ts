// OceanFresh Admin — Reference-aligned breakpoints

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1024,
  wide: 1440,
} as const;

export const mediaQueries = {
  mobile: '@media (max-width: 639px)',
  tablet: '@media (min-width: 640px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
  wide: '@media (min-width: 1440px)',
  // For mobile-first
  mobileUp: '@media (min-width: 640px)',
  tabletUp: '@media (min-width: 1024px)',
  desktopUp: '@media (min-width: 1440px)',
} as const;

export const isMobileWidth = (width: number) => width < breakpoints.mobile;
export const isTabletWidth = (width: number) =>
  width >= breakpoints.mobile && width < breakpoints.desktop;
export const isDesktopWidth = (width: number) => width >= breakpoints.desktop;

export type BreakpointKey = keyof typeof breakpoints;
