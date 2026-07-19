import { rtdbGet, rtdbSet } from './rtdb';
import type { DeliveryCharge } from './types';

export const settingsRepository = {
  async getWA(): Promise<string> {
    const snap = await rtdbGet<{ number: string }>('settings/of_wa');
    return snap?.number ?? '918509597935';
  },

  async setWA(num: string): Promise<void> {
    await rtdbSet('settings/of_wa', { number: num });
  },

  async getDeliveryCharge(): Promise<DeliveryCharge> {
    const snap = await rtdbGet<DeliveryCharge>('settings/delivery_charge');
    return snap ?? { amount: 0, freeAbove: 0 };
  },

  async setDeliveryCharge(data: DeliveryCharge): Promise<void> {
    await rtdbSet('settings/delivery_charge', data);
  },
};
