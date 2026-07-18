import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/storefront',
  'apps/admin',
  'packages/shared',
  'packages/ui',
  'packages/firebase',
]);
