/**
 * Responsive breakpoints used across the app (mirrors the admin drawer
 * split between the previous React Native build and this web version).
 */
export const breakpoints = {
  /** Phones (portrait). */
  mobile: 480,
  /** Small tablets / large phones in landscape. */
  tablet: 768,
  /** Width at which the admin sidebar becomes permanent. */
  desktop: 1024,
} as const;

/** True when the layout is desktop-class (permanent sidebar, multi-column grids). */
export function isDesktopWidth(width: number): boolean {
  return width >= breakpoints.desktop;
}
