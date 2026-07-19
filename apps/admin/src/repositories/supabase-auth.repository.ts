import { getClient, initSupabase, supabaseService } from '@oceanfresh/supabase';

import type { AdminProfile } from './types';

let _otpData: { code: string; ts: number } | null = null;

export const authRepository = {
  async getAdmin(): Promise<AdminProfile> {
    const defaults: AdminProfile = { mobile: '8509597935', password: '', name: 'Shop Owner' };
    const rows = await supabaseService.query<Record<string, unknown>>('admin_profiles', []);
    const data = rows[0];
    return data
      ? {
          mobile: data.mobile as string,
          password: data.password_hash as string,
          name: data.name as string,
        }
      : defaults;
  },

  async updateAdmin(data: Partial<AdminProfile>): Promise<void> {
    const rows = await supabaseService.query<Record<string, unknown>>('admin_profiles', []);
    if (rows[0]) {
      await supabaseService.update('admin_profiles', rows[0].id as string, {
        ...data,
        password_hash: data.password,
      });
    } else {
      await supabaseService.add('admin_profiles', { ...data, password_hash: data.password });
    }
  },

  async checkLogin(mobile: string, password: string): Promise<boolean> {
    const input = mobile.trim();
    const email = input.includes('@') ? input : `${input}@freshcatch.com`;

    try {
      initSupabase();
      const { error } = await getClient().auth.signInWithPassword({ email, password });
      if (!error) return true;
    } catch {}

    const admin = await authRepository.getAdmin();
    if (admin.mobile === input && admin.password === password) {
      localStorage.setItem(
        'of_session',
        JSON.stringify({
          loggedIn: true,
          ts: Date.now(),
          uid: 'admin_db_user',
        }),
      );
      return true;
    }

    return false;
  },

  isLoggedIn(): boolean {
    try {
      const s = JSON.parse(localStorage.getItem('of_session') ?? '{}');
      return s.loggedIn === true;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      initSupabase();
      await getClient().auth.signOut();
    } catch {}
    localStorage.setItem('of_session', JSON.stringify({ loggedIn: false }));
  },

  generateOTP(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    _otpData = { code, ts: Date.now() };
    return code;
  },

  verifyOTP(val: string): boolean {
    if (!_otpData) return false;
    return Date.now() - _otpData.ts <= 300000 && _otpData.code === val;
  },

  clearOTP(): void {
    _otpData = null;
  },
};
