import { STORE_SETTINGS, type StoreSettings } from '@oceanfresh/shared';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { settingsService } from '../services/settings.service.js';

interface SettingsContextValue {
  settings: StoreSettings;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: STORE_SETTINGS,
  error: null,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(STORE_SETTINGS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    settingsService
      .getSettings()
      .then((loaded) => {
        if (mounted) {
          setSettings(loaded);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) setError((err as Error).message ?? 'Failed to load store settings');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, error }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): StoreSettings {
  return useContext(SettingsContext).settings;
}

export function useSettingsError(): string | null {
  return useContext(SettingsContext).error;
}
