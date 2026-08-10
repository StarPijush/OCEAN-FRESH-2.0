import { registerAuthRepository } from '@oceanfresh/auth/repository';
import { registerCategoryRepository } from '@oceanfresh/category/repository';
import { registerOrderRepository } from '@oceanfresh/order/repository';
import { registerProductRepository } from '@oceanfresh/product/repository';
import { registerSettingsRepository } from '@oceanfresh/settings/repository';
import { initSupabase } from '@oceanfresh/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

/**
 * Initializes the shared data layer ONCE at app start:
 *  - Supabase client first (with AsyncStorage session persistence for native),
 *  - then the DI-registered repositories in dependency order.
 *
 * This mirrors the web admin bootstrap (`apps/legacy-admin-web/src/main.tsx`)
 * without the browser-only pieces.
 */
let bootstrapped = false;

export function bootstrapApp(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  initSupabase({
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    storage: AsyncStorage,
    detectSessionInUrl: false,
  });

  registerAuthRepository();
  registerCategoryRepository();
  registerProductRepository();
  registerOrderRepository();
  registerSettingsRepository();
}
