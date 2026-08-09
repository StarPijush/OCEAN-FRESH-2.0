import { getAuthService } from '@oceanfresh/auth/service';
import { useCallback, useEffect, useState } from 'react';

export type AuthScreen = 'login' | 'forgot' | 'reset';

export function useAdminAuth() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryMode] = useState(
    typeof window !== 'undefined' && window.location.hash.includes('access_token'),
  );

  useEffect(() => {
    if (!recoveryMode) return;
    setCurrentScreen('reset');
    window.history.replaceState(null, '', window.location.pathname);
  }, [recoveryMode]);

  const showScreen = useCallback((screen: AuthScreen) => {
    setError('');
    setCurrentScreen(screen);
  }, []);

  const doLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      await getAuthService().login({ email: email.trim(), password });
      setCurrentScreen('login');
      return true;
    } catch (err) {
      setError((err as Error).message || 'Login failed.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const doForgotSendEmail = useCallback(async (email: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      await getAuthService().resetPassword(email.trim());
      setCurrentScreen('forgot');
      return true;
    } catch (err) {
      setError((err as Error).message || 'Failed to send reset email.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const doResetPassword = useCallback(async (p1: string, p2: string): Promise<boolean> => {
    setError('');
    if (p1.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (p1 !== p2) {
      setError('Passwords do not match.');
      return false;
    }
    setLoading(true);
    try {
      await getAuthService().updatePassword(p1);
      setCurrentScreen('login');
      return true;
    } catch (err) {
      setError((err as Error).message || 'Failed to update password.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const doLogout = useCallback(async () => {
    try {
      await getAuthService().logout();
    } finally {
      setCurrentScreen('login');
    }
  }, []);

  return {
    currentScreen,
    loading,
    error,
    recoveryMode,
    showScreen,
    doLogin,
    doForgotSendEmail,
    doResetPassword,
    doLogout,
    setError,
  };
}
