import { container } from '@oceanfresh/shared';

import type { IAuthRepository } from './auth.repository.js';
import { SupabaseAuthRepository } from './supabase-auth.repository.js';

export const AUTH_REPOSITORY_TOKEN = 'IAuthRepository';

export function registerAuthRepository(): void {
  container.register<IAuthRepository>(
    AUTH_REPOSITORY_TOKEN,
    () => new SupabaseAuthRepository(),
    true,
  );
}

export function getAuthRepository(): IAuthRepository {
  return container.resolve<IAuthRepository>(AUTH_REPOSITORY_TOKEN);
}
