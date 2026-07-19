import { AuthProviderType } from '@oceanfresh/shared';

import type { IAuthProvider } from './auth-provider.interface.js';
import { SupabaseAuthProvider } from './supabase-auth.provider.js';

export function createAuthProvider(
  _type: AuthProviderType = AuthProviderType.EMAIL,
): IAuthProvider {
  return new SupabaseAuthProvider();
}
