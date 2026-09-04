/**
 * OceanFresh — Legal system constants.
 * Single source of truth for Last Updated dates.
 * Update when any privacy / terms / cookie text changes.
 */

export const LEGAL_LAST_UPDATED_ISO = '2026-09-05';

export function formatLegalDate(iso: string = LEGAL_LAST_UPDATED_ISO): string {
  const d = new Date(iso + 'T00:00:00.000Z');
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
