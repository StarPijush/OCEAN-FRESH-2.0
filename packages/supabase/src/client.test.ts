import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createClientMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => {
    createClientMock(...args);
    return { auth: {}, storage: {} };
  },
}));

vi.mock('./inline-env.js', () => ({
  viteEnv: {},
  readViteEnv: () => undefined,
}));

const SUPABASE_URL = 'https://unit-test.supabase.co';
const SUPABASE_ANON_KEY = 'unit-test-anon-key';

async function loadClientModule() {
  vi.resetModules();
  const mod = await import('./client.js');
  return mod;
}

function capturedAuthOptions(): { auth: Record<string, unknown> } {
  expect(createClientMock).toHaveBeenCalledTimes(1);
  return createClientMock.mock.calls[0]?.[2] as { auth: Record<string, unknown> };
}

describe('initSupabase session persistence configuration', () => {
  beforeEach(() => {
    createClientMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('defaults to persisted sessions with localStorage storage on the web', async () => {
    const { initSupabase } = await loadClientModule();
    const storageStub = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage: storageStub });

    initSupabase({ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY });

    const { auth } = capturedAuthOptions();
    expect(auth).toMatchObject({
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    });
    expect(auth.storage).toBe(storageStub);
  });

  it('uses memory-only sessions when persistSession is false (no storage adapter)', async () => {
    const { initSupabase } = await loadClientModule();
    const storageStub = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage: storageStub });

    initSupabase({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      persistSession: false,
      detectSessionInUrl: false,
    });

    const { auth } = capturedAuthOptions();
    expect(auth).toMatchObject({
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    });
    expect(auth.storage).toBeUndefined();
  });

  it('does not attach a custom storage adapter when persistence is disabled', async () => {
    const { initSupabase } = await loadClientModule();
    const customStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };

    initSupabase({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      storage: customStorage,
      persistSession: false,
    });

    const { auth } = capturedAuthOptions();
    expect(auth.storage).toBeUndefined();
  });

  it('still uses the custom storage adapter when persistence is enabled', async () => {
    const { initSupabase } = await loadClientModule();
    const customStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };

    initSupabase({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      storage: customStorage,
      persistSession: true,
    });

    const { auth } = capturedAuthOptions();
    expect(auth.storage).toBe(customStorage);
  });
});
