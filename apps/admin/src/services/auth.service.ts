import { createAuthProvider, type IAuthProvider } from '@oceanfresh/auth/providers';
import { getClient, initSupabase } from '@oceanfresh/supabase';

let provider: IAuthProvider | null = null;

/** Singleton auth provider (Supabase-backed), aligned with the web app. */
export function getAuthProvider(): IAuthProvider {
  if (!provider) {
    initSupabase();
    provider = createAuthProvider();
  }
  return provider;
}

/** Sends a 6-digit email OTP used for both login recovery and password reset. */
export async function sendEmailOtp(email: string): Promise<void> {
  initSupabase();
  const { error } = await getClient().auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: undefined,
    },
  });
  if (error) throw error;
}

/** Alias kept for explicit read-site intent. */
export const resendEmailOtp = sendEmailOtp;

/** Verifies the 6-digit email OTP. Returns the signed-in user. */
export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  initSupabase();
  const { error } = await getClient().auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
}

/** Sets a new password for the current (OTP-authenticated) session. */
export async function resetPassword(newPassword: string): Promise<void> {
  const { error } = await getClient().auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** Signs the current user out on the device. */
export async function signOutLocally(): Promise<void> {
  initSupabase();
  await getClient().auth.signOut();
}
