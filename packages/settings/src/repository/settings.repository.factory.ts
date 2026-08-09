import { container } from '@oceanfresh/shared';

import type { ISettingsRepository } from './settings.repository.js';
import { SupabaseSettingsRepository } from './supabase-settings.repository.js';

export const SETTINGS_REPOSITORY_TOKEN = 'ISettingsRepository';

export function registerSettingsRepository(): void {
  container.register<ISettingsRepository>(
    SETTINGS_REPOSITORY_TOKEN,
    () => new SupabaseSettingsRepository(),
    true,
  );
}

export function getSettingsRepository(): ISettingsRepository {
  return container.resolve<ISettingsRepository>(SETTINGS_REPOSITORY_TOKEN);
}
