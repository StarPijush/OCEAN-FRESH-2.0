import { supabaseService } from '@oceanfresh/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupabaseCustomerRepository } from '../repository/supabase-customer.repository.js';

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

const customerRow = {
  id: 'user-1',
  email: 'buyer@example.com',
  phone: null,
  display_name: 'Buyer One',
  photo_url: null,
  provider: 'EMAIL',
  email_verified: true,
  phone_verified: false,
  account_status: 'ACTIVE',
  is_anonymous: false,
  metadata: {},
  last_login_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('SupabaseCustomerRepository', () => {
  let repository: SupabaseCustomerRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new SupabaseCustomerRepository();
  });

  describe('getById', () => {
    it('returns a customer when found', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(customerRow as never);

      const customer = await repository.getById('user-1');

      expect(customer?.displayName).toBe('Buyer One');
      expect(customer?.email).toBe('buyer@example.com');
      expect(supabaseService.get).toHaveBeenCalledWith('users', 'user-1');
    });

    it('returns null when not found', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(null);

      await expect(repository.getById('missing')).resolves.toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns a customer when found', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([customerRow] as never);

      const customer = await repository.findByEmail('buyer@example.com');

      expect(customer?.id).toBe('user-1');
      expect(supabaseService.query).toHaveBeenCalledWith('users', [
        { field: 'email', operator: 'eq', value: 'buyer@example.com' },
      ]);
    });

    it('returns null when not found', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([] as never);

      await expect(repository.findByEmail('nobody@example.com')).resolves.toBeNull();
    });
  });

  describe('create', () => {
    it('persists a new customer with snake_case columns', async () => {
      vi.mocked(supabaseService.add).mockResolvedValue(customerRow as never);

      const customer = await repository.create({
        id: 'user-1',
        email: 'buyer@example.com',
        phone: null,
        displayName: 'Buyer One',
        photoUrl: null,
        provider: 'EMAIL',
        emailVerified: true,
        phoneVerified: false,
        accountStatus: 'ACTIVE',
        isAnonymous: false,
        metadata: {},
        lastLoginAt: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });

      expect(customer.displayName).toBe('Buyer One');
      const payload = vi.mocked(supabaseService.add).mock.calls[0]?.[1] as Record<string, unknown>;
      expect(payload.display_name).toBe('Buyer One');
    });
  });

  describe('update', () => {
    it('updates only provided fields', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(customerRow as never);
      vi.mocked(supabaseService.update).mockResolvedValue(undefined);

      await repository.update('user-1', { displayName: 'Renamed' });

      const payload = vi.mocked(supabaseService.update).mock.calls[0]?.[2] as Record<
        string,
        unknown
      >;
      expect(payload.display_name).toBe('Renamed');
      expect(supabaseService.update).toHaveBeenCalledWith('users', 'user-1', expect.anything());
    });

    it('throws NotFoundError when the customer does not exist', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(null);

      await expect(repository.update('missing', { displayName: 'X' })).rejects.toThrow(
        'Customer not found',
      );
    });
  });
});
