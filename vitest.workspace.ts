import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/storefront',
  'apps/admin',
  'packages/auth',
  'packages/cart',
  'packages/category',
  'packages/customer',
  'packages/order',
  'packages/product',
  'packages/settings',
  'packages/shared',
  'packages/supabase',
]);
