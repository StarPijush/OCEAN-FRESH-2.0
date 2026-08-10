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
  /** Custom auth storage (e.g. AsyncStorage on React Native). */
  storage?: SupabaseAuthStorage;
  /** Detect session from URL (keep false on native). */
  detectSessionInUrl?: boolean;
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

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Explicit session persistence: Supabase remains the auth source of
      // truth; supabase-js stores the session (localStorage on web, the
      // provided AsyncStorage adapter on native) and restores it automatically.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: options.detectSessionInUrl ?? true,
      storage: options.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined),
    },
  });

  return supabaseClient;
}

export function getClient(): SupabaseClient {
  if (!supabaseClient) throw new Error('Supabase not initialized. Call initSupabase() first.');
  return supabaseClient;
}
