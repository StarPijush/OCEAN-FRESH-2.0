import { type AdminProfile, getAuthRepository } from '@oceanfresh/auth/repository';
import { getSettingsRepository, type SettingsUpdate } from '@oceanfresh/settings/repository';
import type { StoreSettings } from '@oceanfresh/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const SETTINGS_KEY = ['settings'] as const;
export const PROFILE_KEY = ['settings', 'profile'] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: (): Promise<StoreSettings> => getSettingsRepository().getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: SettingsUpdate) => getSettingsRepository().updateSettings(update),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
}

export function useAdminProfile(userId: string | undefined) {
  return useQuery({
    queryKey: [...PROFILE_KEY, userId],
    queryFn: (): Promise<AdminProfile | null> =>
      userId ? getAuthRepository().getAdminProfile(userId) : Promise.resolve(null),
    enabled: Boolean(userId),
  });
}
