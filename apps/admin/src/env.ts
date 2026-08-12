// Public environment values. Vite statically inlines `import.meta.env.VITE_*`
// at bundle time (envDir is the monorepo root), so only member-access reads
// are allowed (no dynamic keys).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
export const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'products';
export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? '';
