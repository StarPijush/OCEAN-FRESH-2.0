export {
  CUSTOMER_REPOSITORY_TOKEN,
  getCustomerRepository,
  registerCustomerRepository,
} from './customer.repository.factory.js';
export type { Customer, CustomerUpdate, ICustomerRepository } from './customer.repository.js';
export { SupabaseCustomerRepository } from './supabase-customer.repository.js';
