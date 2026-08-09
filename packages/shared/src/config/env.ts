import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().default(''),
  VITE_SUPABASE_ANON_KEY: z.string().default(''),
  VITE_SUPABASE_STORAGE_BUCKET: z.string().default('products'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

function getSource(): Record<string, string | undefined> {
  try {
    // Check import.meta.env first — in Vite browser builds, process is polyfilled
    // so process.env.NODE_ENV exists but it does NOT contain VITE_* variables.
    // We must read from import.meta.env to get the Vite-injected env vars.
    if (typeof import.meta !== 'undefined') {
      const env = (import.meta as unknown as { env: Record<string, string> }).env;
      if (env && env['VITE_SUPABASE_URL']) {
        const result: Record<string, string | undefined> = {};
        for (const key of Object.keys(env)) {
          result[key] = env[key];
        }
        return result;
      }
    }
    // Fallback to process.env for Node.js/SSR contexts
    if (typeof process !== 'undefined' && process.env?.['NODE_ENV']) {
      return process.env as Record<string, string | undefined>;
    }
    return {};
  } catch {
    return {};
  }
}

export function loadEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const source = getSource();
  const result = envSchema.safeParse(source);

  cachedEnv = result.success ? result.data : envSchema.parse({});
  return cachedEnv;
}

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    return loadEnv();
  }
  return cachedEnv;
}

export const env = getEnv();
