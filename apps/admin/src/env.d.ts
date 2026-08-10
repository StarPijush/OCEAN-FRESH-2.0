/**
 * Ambient typing for `import.meta.env` when the app is compiled without the
 * `vite/client` types (Expo/Metro toolchain). Workspace packages read
 * `import.meta.env.VITE_*` with a `process.env.EXPO_PUBLIC_*` fallback.
 */
interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly MODE?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_STORAGE_BUCKET?: string;
  [key: string]: unknown;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
