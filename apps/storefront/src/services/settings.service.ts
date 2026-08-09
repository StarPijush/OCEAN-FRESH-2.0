import { getSettingsRepository } from '@oceanfresh/settings/repository';
import type { StoreSettings } from '@oceanfresh/shared';

export const settingsService = {
  /**
   * Loads store settings from the shop_settings table via the settings
   * repository (single source of truth). The repository throws when the
   * row is missing or unreachable — callers decide how to surface it.
   */
  async getSettings(): Promise<StoreSettings> {
    return getSettingsRepository().getSettings();
  },
};
