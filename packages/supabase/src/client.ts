import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use direct static property access so Vite can inline the values at build time.
// Dynamic bracket access (e.g. import.meta.env[key]) is NOT replaced by Vite's
// static analysis and causes empty strings, which makes supabase-js fall back
// to its internal default of http://localhost:54321.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabaseClient: SupabaseClient | null = null;

export function initSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = SUPABASE_URL ?? '';
  const supabaseAnonKey = SUPABASE_ANON_KEY ?? '';

  // Dev-only: log environment values so the URL passed to createClient() is visible.
  if (import.meta.env.DEV) {
    console.warn('[Supabase] MODE:', import.meta.env.MODE);
    console.warn(
      '[Supabase] VITE_SUPABASE_URL:',
      supabaseUrl || '(empty — check .env.development)',
    );
    console.warn('[Supabase] VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Explicit session persistence: Supabase remains the auth source of
      // truth; supabase-js stores the session in localStorage and restores it
      // automatically on page reload / new tabs.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  return supabaseClient;
}

export function getClient(): SupabaseClient {
  if (!supabaseClient) throw new Error('Supabase not initialized. Call initSupabase() first.');
  return supabaseClient;
}
