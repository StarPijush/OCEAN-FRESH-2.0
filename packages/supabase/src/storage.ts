import { getClient, initSupabase } from './client.js';

function getStorageBucket(): string {
  try {
    const urlKey = 'VITE_SUPABASE_STORAGE_BUCKET';
    const bucket =
      (import.meta as unknown as Record<string, Record<string, string>>).env?.[urlKey] ??
      'products';
    return bucket;
  } catch {
    return 'products';
  }
}

export const storageService = {
  async upload(path: string, file: File | Blob): Promise<string> {
    initSupabase();
    const bucket = getStorageBucket();
    const { error } = await getClient().storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;

    const { data: urlData } = getClient().storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  },

  async getUrl(path: string): Promise<string> {
    initSupabase();
    const bucket = getStorageBucket();
    const { data: urlData } = getClient().storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  },

  async remove(path: string): Promise<void> {
    initSupabase();
    const bucket = getStorageBucket();
    const { error } = await getClient().storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
