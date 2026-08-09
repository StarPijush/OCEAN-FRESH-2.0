import { SupabaseAuthProvider } from '@oceanfresh/auth/providers';
import { getAuthRepository } from '@oceanfresh/auth/repository';
import { getAuthService } from '@oceanfresh/auth/service';
import { getSettingsRepository } from '@oceanfresh/settings/repository';

import type { DeliveryCharge } from '../types.js';

export interface ValidationError {
  field: string;
  message: string;
}

function validateName(name: string): string | null {
  if (!name.trim()) return 'Name cannot be empty';
  return null;
}

function validateMobile(mobile: string): string | null {
  if (mobile.length < 10) return 'Enter a valid mobile number';
  return null;
}

function normalizeWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return '91' + digits.slice(-10);
}

export const settingsService = {
  async getProfile(): Promise<{ name: string; mobile: string; email: string } | null> {
    const provider = new SupabaseAuthProvider();
    const user = await provider.getCurrentUser();
    if (!user) return null;
    const profile = await getAuthRepository().getAdminProfile(user.id);
    return {
      name: profile?.fullName ?? user.displayName ?? '',
      mobile: profile?.mobile ?? '',
      email: user.email ?? '',
    };
  },

  async updateProfile(data: {
    name: string;
    mobile: string;
  }): Promise<{ success: boolean; error?: string }> {
    const nameErr = validateName(data.name);
    if (nameErr) return { success: false, error: nameErr };
    const mobileErr = validateMobile(data.mobile);
    if (mobileErr) return { success: false, error: mobileErr };

    const provider = new SupabaseAuthProvider();
    const user = await provider.getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      await getAuthRepository().updateAdminProfile(user.id, {
        fullName: data.name.trim(),
        mobile: data.mobile.trim(),
      });
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to save profile' };
    }
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    try {
      const provider = new SupabaseAuthProvider();
      await provider.reauthenticate(currentPassword);
      await getAuthService().updatePassword(newPassword);
      return { success: true };
    } catch (err) {
      const message = (err as Error).message ?? '';
      if (message.toLowerCase().includes('invalid') || message.includes('credentials')) {
        return { success: false, error: 'Current password is incorrect' };
      }
      return { success: false, error: 'Failed to change password' };
    }
  },

  async getWhatsAppNumber(): Promise<string> {
    const settings = await getSettingsRepository().getSettings();
    return settings.whatsapp;
  },

  async updateWhatsAppNumber(raw: string): Promise<{ success: boolean; error?: string }> {
    const normalized = normalizeWhatsAppNumber(raw);
    if (!normalized) return { success: false, error: 'Enter a valid WhatsApp number' };
    try {
      await getSettingsRepository().updateSettings({ whatsapp: normalized });
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to save WhatsApp number' };
    }
  },

  async getDeliveryCharge(): Promise<DeliveryCharge> {
    const settings = await getSettingsRepository().getSettings();
    return { amount: settings.deliveryFee, freeAbove: settings.freeDeliveryAbove };
  },

  async updateDeliveryCharge(data: DeliveryCharge): Promise<{ success: boolean; error?: string }> {
    if (data.amount < 0) return { success: false, error: 'Charge cannot be negative' };
    try {
      await getSettingsRepository().updateSettings({
        deliveryFee: data.amount,
        freeDeliveryAbove: data.freeAbove,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to save delivery charge' };
    }
  },
};
