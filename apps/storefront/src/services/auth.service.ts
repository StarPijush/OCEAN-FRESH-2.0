import { getClient } from '@oceanfresh/supabase';

/**
 * Storefront OTP auth service — uses canonical Supabase APIs.
 * Reference: packages/supabase/src/client.ts (getClient/initSupabase),
 * packages/supabase/src/auth.ts (sendPasswordReset/updatePassword),
 * apps/admin/src/services/auth.service.ts (OTP flow).
 * Do not store OTPs/tokens in localStorage; Supabase handles session internally.
 */

export async function sendEmailOtp(email: string): Promise<void> {
  const { error } = await getClient().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: undefined },
  });
  if (error) throw error;
}

export const resendEmailOtp = sendEmailOtp;

export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  const { error } = await getClient().auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
}

export async function resetPassword(newPassword: string): Promise<void> {
  const { error } = await getClient().auth.updateUser({ password: newPassword });
  if (error) throw error;
}
