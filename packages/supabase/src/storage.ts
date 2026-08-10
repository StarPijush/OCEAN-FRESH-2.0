import { getClient, initSupabase } from './client.js';
import { readViteEnv } from './inline-env.js';

/**
 * Static member access so bundlers can inline the value at build time
 * (`VITE_SUPABASE_STORAGE_BUCKET` under Vite, `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET`
 * under Expo CLI) with a project-wide canonical fallback of 'products'.
 */
const STORAGE_BUCKET: string = (() => {
  const viteValue = readViteEnv('VITE_SUPABASE_STORAGE_BUCKET');
  if (viteValue) return viteValue;
  return process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'products';
})();

/**
 * A file body accepted by supabase-js uploads. On React Native, files are plain
 * objects `{ uri, name, type }` that are turned into multipart form data by the
 * supabase client — full `File`/`Blob` are web-only.
 */
export type UploadableFile = File | Blob | { uri: string; name: string; type?: string };

export const storageService = {
  async upload(path: string, file: UploadableFile): Promise<string> {
    initSupabase();
    const { error } = await getClient()
      .storage.from(STORAGE_BUCKET)
      .upload(path, file as unknown as Blob, { upsert: true });
    if (error) throw error;

    const { data: urlData } = getClient().storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
  },

  async getUrl(path: string): Promise<string> {
    initSupabase();
    const { data: urlData } = getClient().storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
  },

  async remove(path: string): Promise<void> {
    initSupabase();
    const { error } = await getClient().storage.from(STORAGE_BUCKET).remove([path]);
    if (error) throw error;
  },
};
