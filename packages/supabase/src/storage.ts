import { getClient, initSupabase } from './client.js';

// Static property access so Vite can inline the value at build time (see the
// same note in client.ts — dynamic bracket access is NOT replaced by Vite).
// Falls back to the project-wide canonical bucket name 'products'.
const STORAGE_BUCKET =
  (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined) || 'products';

export const storageService = {
  async upload(path: string, file: File | Blob): Promise<string> {
    initSupabase();
    const { error } = await getClient()
      .storage.from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true });
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
