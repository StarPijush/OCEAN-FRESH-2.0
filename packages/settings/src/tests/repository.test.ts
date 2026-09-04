import { STORE_SETTINGS } from '@oceanfresh/shared';
import { supabaseService } from '@oceanfresh/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupabaseSettingsRepository } from '../repository/supabase-settings.repository.js';

vi.mock('@oceanfresh/supabase', async (importOriginal) => {
  const mod = await importOriginal<typeof supabaseService>();
  return {
    ...mod,
    supabaseService: {
      get: vi.fn(),
      query: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      upsert: vi.fn(),
    },
  };
});

const fullRow = {
  id: 'default',
  whatsapp_number: '918509597935',
  delivery_charge_amount: 40,
  delivery_free_above: 500,
  store_name: 'OceanFresh',
  store_tagline: 'Fresh Seafood · Jhargram, West Bengal',
  phone_display: '+91 85095 97935',
  phone_raw: '+918509597935',
  email: 'hello@oceanfresh.in',
  address: ['Shop No. 12, Fish Market', 'Jhargram, West Bengal 721507'],
  hours: ['Mon–Sat · 6AM – 9PM', 'Sunday · 6AM – 2PM'],
  pincodes: ['721501', '721507'],
  delivery_areas: ['Jamboni', 'Binpur'],
  delivery_radius: 15,
  founded_year: 2018,
  // 021 — active social: Instagram, Facebook, YouTube (X/LinkedIn legacy columns remain in DB but not in product)
  instagram_url: 'https://www.instagram.com/oceanfresh',
  facebook_url: 'https://www.facebook.com/oceanfresh',
  youtube_url: 'https://www.youtube.com/@oceanfresh',
  latitude: 22.45,
  longitude: 86.98,
  google_maps_url: null,
  place_id: null,
  city: 'Jhargram',
  state: 'West Bengal',
  postal_code: '721507',
};

describe('SupabaseSettingsRepository', () => {
  let repository: SupabaseSettingsRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new SupabaseSettingsRepository();
  });

  describe('getSettings', () => {
    it('maps the full shop_settings row to StoreSettings', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(fullRow as never);

      const settings = await repository.getSettings();

      expect(settings.storeName).toBe('OceanFresh');
      expect(settings.whatsapp).toBe('918509597935');
      expect(settings.deliveryFee).toBe(40);
      expect(settings.freeDeliveryAbove).toBe(500);
      expect(settings.pincodes).toEqual(['721501', '721507']);
      expect(settings.deliveryRadius).toBe(15);
      expect(settings.foundedYear).toBe(2018);
      expect(settings.instagramUrl).toBe('https://www.instagram.com/oceanfresh');
      expect(settings.facebookUrl).toBe('https://www.facebook.com/oceanfresh');
      expect(settings.youtubeUrl).toBe('https://www.youtube.com/@oceanfresh');
      // Legacy X/LinkedIn columns are not part of active StoreSettings (Option A) — ensure not present
      expect((settings as unknown as Record<string, unknown>).xUrl).toBeUndefined();
      expect((settings as unknown as Record<string, unknown>).linkedinUrl).toBeUndefined();
      expect(settings.latitude).toBe(22.45);
      expect(settings.longitude).toBe(86.98);
      // googleMapsUrl derived from lat/lng when explicit null
      expect(settings.googleMapsUrl).toBe('https://www.google.com/maps?q=22.45,86.98');
      expect(settings.city).toBe('Jhargram');
      expect(supabaseService.get).toHaveBeenCalledWith('shop_settings', 'default');
    });

    it('falls back to shared defaults for missing fields', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue({
        id: 'default',
        whatsapp_number: null,
        delivery_charge_amount: null,
        delivery_free_above: null,
      } as never);

      const settings = await repository.getSettings();

      expect(settings.whatsapp).toBe(STORE_SETTINGS.whatsapp);
      expect(settings.deliveryFee).toBe(STORE_SETTINGS.deliveryFee);
      expect(settings.addressLines).toEqual(STORE_SETTINGS.addressLines);
    });

    it('throws when the settings row is missing (no silent fallback)', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(null);

      await expect(repository.getSettings()).rejects.toThrow();
    });

    it('wraps supabase errors in RepositoryError', async () => {
      vi.mocked(supabaseService.get).mockRejectedValue(new Error('network down'));

      await expect(repository.getSettings()).rejects.toThrow('Failed to load shop settings');
    });
  });

  describe('updateSettings', () => {
    it('persists a partial update and returns refreshed settings', async () => {
      vi.mocked(supabaseService.upsert).mockResolvedValue(fullRow as never);
      vi.mocked(supabaseService.get).mockResolvedValue(fullRow as never);

      const result = await repository.updateSettings({
        deliveryFee: 50,
        freeDeliveryAbove: 600,
      });

      expect(supabaseService.upsert).toHaveBeenCalledWith(
        'shop_settings',
        'default',
        expect.objectContaining({ delivery_charge_amount: 50, delivery_free_above: 600 }),
      );
      expect(result.deliveryFee).toBe(40);
    });

    it('only sends defined fields', async () => {
      vi.mocked(supabaseService.upsert).mockResolvedValue(fullRow as never);
      vi.mocked(supabaseService.get).mockResolvedValue(fullRow as never);

      await repository.updateSettings({ whatsapp: '918509597935' });

      const payload = vi.mocked(supabaseService.upsert).mock.calls[0]?.[2] as Record<
        string,
        unknown
      >;
      expect(Object.keys(payload).sort()).toEqual(['whatsapp_number']);
    });

    it('returns current settings when the update is empty', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(fullRow as never);

      const result = await repository.updateSettings({});

      expect(supabaseService.upsert).not.toHaveBeenCalled();
      expect(result.whatsapp).toBe('918509597935');
    });

    it('wraps supabase errors in RepositoryError', async () => {
      vi.mocked(supabaseService.upsert).mockRejectedValue(new Error('permission denied'));

      await expect(repository.updateSettings({ deliveryFee: 55 })).rejects.toThrow(
        'Failed to update shop settings',
      );
    });
  });
});
