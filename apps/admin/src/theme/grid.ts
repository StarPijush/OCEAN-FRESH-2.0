import { breakpoints } from './breakpoints';

/** Shared gutter used by the stat tile row. */
export const STAT_GUTTER = 6;

/**
 * Column width for the stat grid at the current viewport:
 * 1 col <480 · 2 cols 480–767 · 3 cols 768–1023 · 4 cols ≥1024.
 */
export function statTileWidth(width: number): `${number}%` {
  const cols =
    width >= breakpoints.desktop
      ? 4
      : width >= breakpoints.tablet
        ? 3
        : width >= breakpoints.mobile
          ? 2
          : 1;
  return `${100 / cols}%`;
}
