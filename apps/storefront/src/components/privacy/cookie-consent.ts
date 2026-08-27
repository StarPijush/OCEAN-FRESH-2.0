/**
 * OceanFresh — Cookie Consent Model & Persistence
 * Production-grade, versioned, single-key storage.
 * Audit: only necessary localStorage exists (fresh-catch-cart, oceanfresh.auth.session, sb-*-auth-token).
 * No analytics/marketing storage currently — optional categories are infrastructure for future.
 */

export const CONSENT_STORAGE_KEY = 'oceanfresh-cookie-consent';
export const CONSENT_VERSION = '1.0' as const;

export type CookieConsent = {
  version: typeof CONSENT_VERSION;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string; // ISO 8601
};

export type ConsentCategory = 'analytics' | 'marketing' | 'preferences';

export function defaultConsent(overrides?: Partial<CookieConsent>): CookieConsent {
  return {
    version: CONSENT_VERSION,
    necessary: true as const,
    analytics: overrides?.analytics ?? false,
    marketing: overrides?.marketing ?? false,
    preferences: overrides?.preferences ?? false,
    timestamp: overrides?.timestamp ?? new Date().toISOString(),
  };
}

export function validateConsent(raw: unknown): CookieConsent | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o['version'] !== CONSENT_VERSION) return null;
  if (o['necessary'] !== true) return null;
  if (typeof o['analytics'] !== 'boolean') return null;
  if (typeof o['marketing'] !== 'boolean') return null;
  if (typeof o['preferences'] !== 'boolean') return null;
  if (typeof o['timestamp'] !== 'string' || Number.isNaN(Date.parse(o['timestamp'] as string)))
    return null;
  return o as CookieConsent;
}

export function readConsent(): CookieConsent | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return validateConsent(parsed);
  } catch {
    return null;
  }
}

export function writeConsent(consent: CookieConsent): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const toStore: CookieConsent = {
      ...consent,
      version: CONSENT_VERSION,
      necessary: true,
      timestamp: consent.timestamp || new Date().toISOString(),
    };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(toStore));
    // Notify other tabs / listeners
    try {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: CONSENT_STORAGE_KEY,
          newValue: JSON.stringify(toStore),
        }),
      );
    } catch {
      // ignore
    }
  } catch {
    // quota exceeded or private mode — fail silently
  }
}

export function clearConsent(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function canLoad(category: ConsentCategory): boolean {
  const c = readConsent();
  if (!c) return false;
  return c[category] === true;
}

export function hasConsented(): boolean {
  return readConsent() !== null;
}
