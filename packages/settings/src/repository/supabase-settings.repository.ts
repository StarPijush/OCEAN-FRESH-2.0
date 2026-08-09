import {
  NotFoundError,
  RepositoryError,
  STORE_SETTINGS,
  type StoreSettings,
} from '@oceanfresh/shared';
import { supabaseService } from '@oceanfresh/supabase';

import type { ISettingsRepository, SettingsUpdate } from './settings.repository.js';

const TABLE = 'shop_settings';
const ROW_ID = 'default';

interface ShopSettingsRow {
  id: string;
  whatsapp_number: string | null;
  delivery_charge_amount: number | null;
  delivery_free_above: number | null;
  store_name: string | null;
  store_tagline: string | null;
  phone_display: string | null;
  phone_raw: string | null;
  email: string | null;
  address: string[] | null;
  hours: string[] | null;
  pincodes: string[] | null;
  delivery_areas: string[] | null;
  delivery_radius: number | null;
  founded_year: number | null;
}

function toStoreSettings(row: ShopSettingsRow): StoreSettings {
  return {
    storeName: row.store_name || STORE_SETTINGS.storeName,
    tagline: row.store_tagline || STORE_SETTINGS.tagline,
    whatsapp: row.whatsapp_number || STORE_SETTINGS.whatsapp,
    phoneDisplay: row.phone_display || STORE_SETTINGS.phoneDisplay,
    phoneRaw: row.phone_raw || STORE_SETTINGS.phoneRaw,
    email: row.email || STORE_SETTINGS.email,
    addressLines: row.address && row.address.length > 0 ? row.address : STORE_SETTINGS.addressLines,
    hours: row.hours && row.hours.length > 0 ? row.hours : STORE_SETTINGS.hours,
    freeDeliveryAbove:
      row.delivery_free_above != null
        ? Number(row.delivery_free_above)
        : STORE_SETTINGS.freeDeliveryAbove,
    deliveryFee:
      row.delivery_charge_amount != null
        ? Number(row.delivery_charge_amount)
        : STORE_SETTINGS.deliveryFee,
    pincodes: row.pincodes && row.pincodes.length > 0 ? row.pincodes : STORE_SETTINGS.pincodes,
    deliveryAreas:
      row.delivery_areas && row.delivery_areas.length > 0
        ? row.delivery_areas
        : STORE_SETTINGS.deliveryAreas,
    deliveryRadius:
      row.delivery_radius != null ? Number(row.delivery_radius) : STORE_SETTINGS.deliveryRadius,
    orderWhatsApp: row.whatsapp_number || STORE_SETTINGS.orderWhatsApp,
    foundedYear: row.founded_year ?? STORE_SETTINGS.foundedYear,
  };
}

function toRowPayload(update: SettingsUpdate): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    store_name: update.storeName,
    store_tagline: update.tagline,
    whatsapp_number: update.whatsapp,
    phone_display: update.phoneDisplay,
    phone_raw: update.phoneRaw,
    email: update.email,
    address: update.addressLines,
    hours: update.hours,
    pincodes: update.pincodes,
    delivery_areas: update.deliveryAreas,
    delivery_free_above: update.freeDeliveryAbove,
    delivery_charge_amount: update.deliveryFee,
    delivery_radius: update.deliveryRadius,
    founded_year: update.foundedYear,
  };
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

export class SupabaseSettingsRepository implements ISettingsRepository {
  async getSettings(): Promise<StoreSettings> {
    try {
      const row = await supabaseService.get<ShopSettingsRow>(TABLE, ROW_ID);
      if (!row) {
        throw new NotFoundError(
          `Shop settings row '${ROW_ID}' not found — apply database/009_seed.sql`,
        );
      }
      return toStoreSettings(row);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to load shop settings', 'getSettings', TABLE, {
        error: err,
      });
    }
  }

  async updateSettings(update: SettingsUpdate): Promise<StoreSettings> {
    try {
      const payload = toRowPayload(update);
      if (Object.keys(payload).length === 0) return this.getSettings();
      await supabaseService.upsert<ShopSettingsRow>(TABLE, ROW_ID, payload);
      return this.getSettings();
    } catch (err) {
      throw new RepositoryError('Failed to update shop settings', 'updateSettings', TABLE, {
        error: err,
      });
    }
  }
}
