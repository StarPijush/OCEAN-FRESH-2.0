import type { StoreSettings } from '@oceanfresh/shared';

export interface SettingsUpdate {
  storeName?: string;
  tagline?: string;
  whatsapp?: string;
  phoneDisplay?: string;
  phoneRaw?: string;
  email?: string;
  addressLines?: string[];
  hours?: string[];
  freeDeliveryAbove?: number;
  deliveryFee?: number;
  pincodes?: string[];
  deliveryAreas?: string[];
  deliveryRadius?: number;
  foundedYear?: number;
}

export interface ISettingsRepository {
  /** Reads the single shop_settings row and maps it to StoreSettings. */
  getSettings(): Promise<StoreSettings>;
  /** Persists partial settings to the shop_settings row ('default'). */
  updateSettings(update: SettingsUpdate): Promise<StoreSettings>;
}
