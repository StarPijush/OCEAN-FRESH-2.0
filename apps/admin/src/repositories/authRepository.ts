import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { getApp } from '@oceanfresh/firebase';
import { rtdbGet, rtdbUpdate } from './rtdb';
import type { AdminProfile } from './types';

let _otpData: { code: string; ts: number } | null = null;

export const authRepository = {
  async getAdmin(): Promise<AdminProfile> {
    const defaults: AdminProfile = { mobile: '8509597935', password: '', name: 'Shop Owner' };
    const data = await rtdbGet<Partial<AdminProfile>>('settings/of_admin');
    return { ...defaults, ...data };
  },

  async updateAdmin(data: Partial<AdminProfile>): Promise<void> {
    await rtdbUpdate('settings/of_admin', data as Record<string, unknown>);
  },

  async checkLogin(mobile: string, password: string): Promise<boolean> {
    const input = mobile.trim();
    const email = input.includes('@') ? input : `${input}@freshcatch.com`;

    try {
      const auth = getAuth(getApp());
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
    }

    const admin = await authRepository.getAdmin();
    if (admin.mobile === input && admin.password === password) {
      localStorage.setItem('of_session', JSON.stringify({
        loggedIn: true, ts: Date.now(), uid: 'admin_db_user',
      }));
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
      await fbSignOut(getAuth(getApp()));
    } catch { /* ignore */ }
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
