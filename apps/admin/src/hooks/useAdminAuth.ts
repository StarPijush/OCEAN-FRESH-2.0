import { useCallback, useEffect, useState } from 'react';

import { authRepository } from '../repositories';

export type AuthScreen = 'login' | 'forgot' | 'otp' | 'reset';

export function useAdminAuth() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpMobile, setOtpMobile] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => authRepository.isLoggedIn());

  useEffect(() => {
    setIsLoggedIn(authRepository.isLoggedIn());
  }, []);

  const showScreen = useCallback((screen: AuthScreen) => {
    setError('');
    setCurrentScreen(screen);
  }, []);

  const doLogin = useCallback(async (mobile: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const ok = await authRepository.checkLogin(mobile, password);
      if (ok) {
        setIsLoggedIn(true);
        return true;
      }
      setError('Incorrect mobile or password.');
      return false;
    } catch {
      setError('A system error occurred.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const doForgotSendOTP = useCallback(async (mobile: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const admin = await authRepository.getAdmin();
      if (admin.mobile !== mobile) {
        setError('Mobile number not found.');
        return false;
      }
      const otp = authRepository.generateOTP();
      alert(`🔑 Your OTP is: ${otp}\n(In production this is sent via SMS)`);
      setOtpMobile(mobile.slice(0, -4) + '****');
      setCurrentScreen('otp');
      return true;
    } catch {
      setError('A system error occurred.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const doVerifyOTP = useCallback((val: string): boolean => {
    setError('');
    if (val.length !== 6) {
      setError('Enter all 6 digits.');
      return false;
    }
    if (authRepository.verifyOTP(val)) {
      authRepository.clearOTP();
      setCurrentScreen('reset');
      return true;
    }
    setError('Incorrect OTP.');
    return false;
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
    try {
      await authRepository.updateAdmin({ password: p1 });
      setCurrentScreen('login');
      return true;
    } catch {
      setError('Failed to update password.');
      return false;
    }
  }, []);

  const doLogout = useCallback(async () => {
    await authRepository.logout();
    setIsLoggedIn(false);
    setCurrentScreen('login');
  }, []);

  return {
    currentScreen,
    loading,
    error,
    otpMobile,
    isLoggedIn,
    showScreen,
    doLogin,
    doForgotSendOTP,
    doVerifyOTP,
    doResetPassword,
    doLogout,
    setError,
  };
}
