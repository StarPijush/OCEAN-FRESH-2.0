import { getClient } from './client.js';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  isAdmin: boolean;
}

function mapUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  return {
    uid: user.id,
    email: user.email ?? null,
    displayName: (user.user_metadata?.display_name as string) ?? null,
    phoneNumber: (user.user_metadata?.phone_number as string) ?? null,
    isAdmin: false,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Login failed');
  return mapUser(data.user);
}

export async function createUser(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await getClient().auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Registration failed');
  return mapUser(data.user);
}

export async function signOut(): Promise<void> {
  const { error } = await getClient().auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
  const {
    data: { subscription },
  } = getClient().auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? mapUser(session.user) : null);
  });
  return () => subscription.unsubscribe();
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await getClient().auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await getClient().auth.updateUser({ password: newPassword });
  if (error) throw error;
}
