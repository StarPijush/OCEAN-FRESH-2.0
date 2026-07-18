import { useAdminAuth } from '../../hooks/useAdminAuth';
import { LoginScreen } from './LoginScreen';
import { ForgotScreen } from './ForgotScreen';
import { OTPScreen } from './OTPScreen';
import { ResetScreen } from './ResetScreen';
import { useAdminToast } from '../shared/AdminToast';

interface Props {
  onLoggedIn: () => void;
}

export function AuthShell({ onLoggedIn }: Props) {
  const {
    currentScreen, loading, error, otpMobile,
    showScreen, doLogin, doForgotSendOTP, doVerifyOTP, doResetPassword, setError,
  } = useAdminAuth();
  const { toast } = useAdminToast();

  const handleLogin = async (mobile: string, password: string) => {
    const ok = await doLogin(mobile, password);
    if (ok) {
      toast('Login successful!', 'success');
      setTimeout(onLoggedIn, 500);
    } else {
      toast('Login failed', 'error');
    }
    return ok;
  };

  const handleSendOTP = async (mobile: string) => {
    const ok = await doForgotSendOTP(mobile);
    if (!ok) toast('Mobile number not found', 'error');
    return ok;
  };

  const handleVerifyOTP = (val: string) => {
    const ok = doVerifyOTP(val);
    if (!ok) {
      toast('Incorrect OTP', 'error');
    }
    return ok;
  };

  const handleReset = async (p1: string, p2: string) => {
    const ok = await doResetPassword(p1, p2);
    if (ok) toast('Password updated successfully', 'success');
    return ok;
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg" />
      <div className="auth-grid" />

      {currentScreen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onForgot={() => showScreen('forgot')}
          error={error}
          loading={loading}
        />
      )}

      {currentScreen === 'forgot' && (
        <ForgotScreen
          onSendOTP={handleSendOTP}
          onBack={() => showScreen('login')}
          error={error}
          loading={loading}
        />
      )}

      {currentScreen === 'otp' && (
        <OTPScreen
          mobile={otpMobile}
          onVerify={handleVerifyOTP}
          onResend={() => {
            const m = document.querySelector<HTMLInputElement>('#forgot-mobile')?.value ?? '';
            if (m) handleSendOTP(m);
          }}
          onBack={() => showScreen('login')}
          error={error}
        />
      )}

      {currentScreen === 'reset' && (
        <ResetScreen
          onReset={handleReset}
          error={error}
        />
      )}
    </div>
  );
}
