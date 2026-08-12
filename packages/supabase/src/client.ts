import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Structural auth storage contract (compatible with supabase-js).
 * Avoids importing a non-exported type: `SupabaseAuthStorage` is not part of
 * the public supabase-js surface.
 */
export interface SupabaseAuthStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

import { readViteEnv } from './inline-env.js';

/**
 * Read a Vite-style Supabase env var with a Metro (Expo) fallback.
 * The `VITE_*` value is inlined by Vite in web builds; under Metro the
 * `EXPO_PUBLIC_*` equivalents are inlined by Expo CLI instead.
 */
export type SupabaseEnvKey = 'URL' | 'ANON_KEY';

export function readSupabaseEnv(key: SupabaseEnvKey): string | undefined {
  const viteValue =
    key === 'URL' ? readViteEnv('VITE_SUPABASE_URL') : readViteEnv('VITE_SUPABASE_ANON_KEY');
  if (viteValue) return viteValue;
  return key === 'URL'
    ? process.env.EXPO_PUBLIC_SUPABASE_URL
    : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
}

export interface SupabaseInitOptions {
  /** Override the project URL resolved from the environment. */
  url?: string;
  /** Override the anon key resolved from the environment. */
  anonKey?: string;
  /**
   * Custom auth storage (e.g. AsyncStorage on React Native).
   * Only meaningful when `persistSession` is true.
   */
  storage?: SupabaseAuthStorage;
  /** Detect session from URL (keep false on native). */
  detectSessionInUrl?: boolean;
  /**
   * Persist the session in the configured storage (default: true).
   * Set to false for memory-only sessions (e.g. the admin apps, which must
   * require a fresh login on every reload/reopen). When false, no storage
   * adapter is used for authentication and any previously persisted session
   * is never restored.
   */
  persistSession?: boolean;
}

let supabaseClient: SupabaseClient | null = null;

export function initSupabase(options: SupabaseInitOptions = {}): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = options.url ?? readSupabaseEnv('URL') ?? '';
  const supabaseAnonKey = options.anonKey ?? readSupabaseEnv('ANON_KEY') ?? '';

  // Dev-only diagnostics: visible when running under Vite (`import.meta.env.DEV`).
  if (readViteEnv('DEV') === 'true') {
    console.warn(
      '[Supabase] SUPABASE_URL:',
      supabaseUrl || '(empty — check .env.development / .env with EXPO_PUBLIC_SUPABASE_URL)',
    );
    console.warn('[Supabase] SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (web) or EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (Expo).',
    );
  }

  const persistSession = options.persistSession ?? true;

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Explicit session persistence policy. Storefront keeps persisted
      // sessions (localStorage / AsyncStorage); admin apps use memory-only
      // sessions (persistSession: false) so a reload or reopen always lands
      // on the login screen and stale persisted sessions are never restored.
      persistSession,
      autoRefreshToken: true,
      detectSessionInUrl: options.detectSessionInUrl ?? true,
      // No storage adapter when persistence is disabled: admin auth lives
      // only in memory.
      storage:
        persistSession && options.storage
          ? options.storage
          : persistSession && typeof window !== 'undefined'
            ? window.localStorage
            : undefined,
    },
  });

  return supabaseClient;
}

export function getClient(): SupabaseClient {
  if (!supabaseClient) throw new Error('Supabase not initialized. Call initSupabase() first.');
  return supabaseClient;
}
