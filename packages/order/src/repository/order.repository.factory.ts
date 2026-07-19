import { container } from '@oceanfresh/shared';

import type { IOrderRepository } from './order.repository.js';
import { SupabaseOrderRepository } from './supabase-order.repository.js';

export const ORDER_REPOSITORY_TOKEN = 'IOrderRepository';

export function registerOrderRepository(): void {
  container.register<IOrderRepository>(
    ORDER_REPOSITORY_TOKEN,
    () => new SupabaseOrderRepository(),
    true,
  );
}

export function getOrderRepository(): IOrderRepository {
  return container.resolve<IOrderRepository>(ORDER_REPOSITORY_TOKEN);
}
