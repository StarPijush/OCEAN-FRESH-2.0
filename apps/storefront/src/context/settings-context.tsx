import { STORE_SETTINGS, type StoreSettings } from '@oceanfresh/shared';
import { useQuery } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext } from 'react';

import { settingsService } from '../services/settings.service.js';

interface SettingsContextValue {
  settings: StoreSettings;
  error: string | null;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: STORE_SETTINGS,
  error: null,
  isLoading: false,
});

/**
 * Single source of truth for storefront settings.
 * Uses TanStack Query for caching (staleTime 5m) and refetchOnWindowFocus
 * so ADMIN SAVE → storefront fetches current value on next focus/mount.
 * No realtime — simplest reliable solution per spec §10.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading } = useQuery<StoreSettings>({
    queryKey: ['store_settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    refetchOnWindowFocus: true,
    placeholderData: STORE_SETTINGS,
  });

  const settings = data ?? STORE_SETTINGS;
  const errorMsg = error ? ((error as Error).message ?? 'Failed to load store settings') : null;

  return (
    <SettingsContext.Provider value={{ settings, error: errorMsg, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): StoreSettings {
  return useContext(SettingsContext).settings;
}

export function useSettingsError(): string | null {
  return useContext(SettingsContext).error;
}

export function useSettingsLoading(): boolean {
  return useContext(SettingsContext).isLoading;
}
