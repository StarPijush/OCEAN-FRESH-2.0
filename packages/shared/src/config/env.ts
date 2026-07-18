import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().default(''),
  VITE_SUPABASE_ANON_KEY: z.string().default(''),
  VITE_SUPABASE_STORAGE_BUCKET: z.string().default('products'),
  VITE_FIREBASE_API_KEY: z.string().default(''),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().default(''),
  VITE_FIREBASE_PROJECT_ID: z.string().default(''),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().default(''),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().default(''),
  VITE_FIREBASE_APP_ID: z.string().default(''),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_APP_NAME: z.string().default('OceanFresh'),
  VITE_APP_URL: z.string().url().default('https://oceanfresh.in'),
  VITE_SENTRY_DSN: z.string().default(''),
  VITE_APP_CHECK_SITE_KEY: z.string().default(''),
  VITE_FEATURE_COUPONS: z.coerce.boolean().default(false),
  VITE_FEATURE_REVIEWS: z.coerce.boolean().default(false),
  VITE_FEATURE_PAYMENTS: z.coerce.boolean().default(false),
  VITE_FEATURE_INVENTORY: z.coerce.boolean().default(true),
  VITE_FEATURE_ANALYTICS: z.coerce.boolean().default(true),
  VITE_MAINTENANCE_MODE: z.coerce.boolean().default(false),
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

  if (!result.success) {
    if (source['VITE_ENVIRONMENT'] === 'production') {
      throw new Error('Environment validation failed');
    }
    cachedEnv = envSchema.parse({});
    return cachedEnv;
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    return loadEnv();
  }
  return cachedEnv;
}

export const env = getEnv();
