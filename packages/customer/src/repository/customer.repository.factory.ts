import { container } from '@oceanfresh/shared';

import type { ICustomerRepository } from './customer.repository.js';
import { SupabaseCustomerRepository } from './supabase-customer.repository.js';

export const CUSTOMER_REPOSITORY_TOKEN = 'ICustomerRepository';

export function registerCustomerRepository(): void {
  container.register<ICustomerRepository>(
    CUSTOMER_REPOSITORY_TOKEN,
    () => new SupabaseCustomerRepository(),
    true,
  );
}

export function getCustomerRepository(): ICustomerRepository {
  return container.resolve<ICustomerRepository>(CUSTOMER_REPOSITORY_TOKEN);
}
