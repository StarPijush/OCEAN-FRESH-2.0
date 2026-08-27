import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CONSENT_VERSION,
  type CookieConsent,
  defaultConsent,
  readConsent,
  writeConsent,
} from '../components/privacy/cookie-consent.js';

type CookieConsentContextValue = {
  consent: CookieConsent | null;
  hasConsented: boolean;
  showBanner: boolean;
  showPreferences: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  declineAll: () => void;
  savePreferences: (prefs: Pick<CookieConsent, 'analytics' | 'marketing' | 'preferences'>) => void;
  reopenBanner: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(() => {
    // SSR safe: readConsent guards window
    return readConsent();
  });
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  // Show banner on first visit (no valid consent)
  useEffect(() => {
    const c = readConsent();
    if (!c) {
      // small delay for entrance animation
      const id = window.setTimeout(() => setShowBanner(true), 400);
      return () => window.clearTimeout(id);
    }
    setConsent(c);
    return undefined;
  }, []);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'oceanfresh-cookie-consent') {
        const c = readConsent();
        setConsent(c);
        if (c) setShowBanner(false);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const acceptAll = useCallback(() => {
    const next = defaultConsent({
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    });
    writeConsent(next);
    setConsent(next);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const declineAll = useCallback(() => {
    const next = defaultConsent({
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    });
    writeConsent(next);
    setConsent(next);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const savePreferences = useCallback(
    (prefs: Pick<CookieConsent, 'analytics' | 'marketing' | 'preferences'>) => {
      const next = defaultConsent({
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        preferences: prefs.preferences,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      });
      writeConsent(next);
      setConsent(next);
      setShowBanner(false);
      setShowPreferences(false);
      // return focus to opener
      if (openerRef.current) {
        openerRef.current.focus();
      }
    },
    [],
  );

  const openPreferences = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setShowPreferences(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferences(false);
    if (openerRef.current) {
      openerRef.current.focus();
    }
  }, []);

  const reopenBanner = useCallback(() => {
    setShowBanner(true);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasConsented: consent !== null,
      showBanner,
      showPreferences,
      openPreferences,
      closePreferences,
      acceptAll,
      declineAll,
      savePreferences,
      reopenBanner,
    }),
    [
      consent,
      showBanner,
      showPreferences,
      openPreferences,
      closePreferences,
      acceptAll,
      declineAll,
      savePreferences,
      reopenBanner,
    ],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return ctx;
}
