import { registerAuthRepository } from '@oceanfresh/auth/repository';
import { getAuthService } from '@oceanfresh/auth/service';
import { registerCategoryRepository } from '@oceanfresh/category/repository';
import { registerOrderRepository } from '@oceanfresh/order/repository';
import { registerProductRepository } from '@oceanfresh/product/repository';
import { registerSettingsRepository } from '@oceanfresh/settings/repository';
import { initSupabase } from '@oceanfresh/supabase';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

/**
 * Initializes the shared data layer ONCE at app start:
 *  - Supabase client first (memory-only admin session),
 *  - then the DI-registered repositories in dependency order.
 *
 * Admin sessions are memory-only: no persistent storage adapter is
 * configured for authentication, so every reload/reopen requires a fresh
 * login and no previously persisted session is ever restored.
 */
let bootstrapped = false;

export function bootstrapApp(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  initSupabase({
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    persistSession: false,
    detectSessionInUrl: false,
  });

  if (typeof window !== 'undefined') {
    localStorage.removeItem('oceanfresh.auth.session');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
  }

  getAuthService({ persistSession: false });

  registerAuthRepository();
  registerCategoryRepository();
  registerProductRepository();
  registerOrderRepository();
  registerSettingsRepository();
}
