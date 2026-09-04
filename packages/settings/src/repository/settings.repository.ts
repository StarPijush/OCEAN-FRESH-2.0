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
  // 021 — Social — active: Instagram, Facebook, YouTube (NULL/empty clears, hides icon)
  // WhatsApp uses existing whatsapp/orderWhatsApp (whatsapp_number). Legacy x_url/linkedin_url remain in DB but not in contract.
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  // 021 — Location (Phase 1: lat/lng + Maps URL, no API secret in DB)
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  placeId?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

export interface ISettingsRepository {
  /** Reads the single shop_settings row and maps it to StoreSettings. */
  getSettings(): Promise<StoreSettings>;
  /** Persists partial settings to the shop_settings row ('default'). */
  updateSettings(update: SettingsUpdate): Promise<StoreSettings>;
}
