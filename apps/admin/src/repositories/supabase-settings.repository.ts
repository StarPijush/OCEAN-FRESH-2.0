import { supabaseService } from '@oceanfresh/supabase';
import type { DeliveryCharge } from './types';

const TABLE = 'shop_settings';

export const settingsRepository = {
  async getWA(): Promise<string> {
    const rows = await supabaseService.query<Record<string, unknown>>(TABLE, []);
    const row = rows[0];
    return (row?.whatsapp_number as string) ?? '918509597935';
  },

  async setWA(num: string): Promise<void> {
    const rows = await supabaseService.query<Record<string, unknown>>(TABLE, []);
    if (rows[0]) {
      await supabaseService.update(TABLE, rows[0].id as string, { whatsapp_number: num });
    } else {
      await supabaseService.add(TABLE, { id: '1', whatsapp_number: num });
    }
  },

  async getDeliveryCharge(): Promise<DeliveryCharge> {
    const rows = await supabaseService.query<Record<string, unknown>>(TABLE, []);
    const row = rows[0];
    return {
      amount: Number(row?.delivery_charge_amount ?? 0),
      freeAbove: Number(row?.delivery_free_above ?? 0),
    };
  },

  async setDeliveryCharge(data: DeliveryCharge): Promise<void> {
    const rows = await supabaseService.query<Record<string, unknown>>(TABLE, []);
    if (rows[0]) {
      await supabaseService.update(TABLE, rows[0].id as string, {
        delivery_charge_amount: data.amount,
        delivery_free_above: data.freeAbove,
      });
    } else {
      await supabaseService.add(TABLE, {
        id: '1',
        delivery_charge_amount: data.amount,
        delivery_free_above: data.freeAbove,
      });
    }
  },
};
