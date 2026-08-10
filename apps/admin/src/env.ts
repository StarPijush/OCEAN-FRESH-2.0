// Public environment values. Expo CLI statically inlines `process.env.EXPO_PUBLIC_*`
// at bundle time, so only member-access reads are allowed (no dynamic keys).
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const SUPABASE_STORAGE_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'products';
export const STOREFRONT_URL = process.env.EXPO_PUBLIC_STOREFRONT_URL ?? '';
