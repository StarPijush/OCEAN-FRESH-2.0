import { container } from '@oceanfresh/shared';
import type { ICartRepository } from './cart.repository.js';
import { SupabaseCartRepository } from './supabase-cart.repository.js';

export const CART_REPOSITORY_TOKEN = 'ICartRepository';

export function registerCartRepository(): void {
  container.register<ICartRepository>(
    CART_REPOSITORY_TOKEN,
    () => new SupabaseCartRepository(),
    true,
  );
}

export function getCartRepository(): ICartRepository {
  return container.resolve<ICartRepository>(CART_REPOSITORY_TOKEN);
}
