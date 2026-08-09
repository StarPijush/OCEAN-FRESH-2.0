import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAdminToast } from '../shared/use-admin-toast.js';
import { ForgotScreen } from './ForgotScreen';
import { LoginScreen } from './LoginScreen';
import { ResetScreen } from './ResetScreen';

interface Props {
  onLoggedIn: () => void;
}

export function AuthShell({ onLoggedIn }: Props) {
  const { currentScreen, loading, error, showScreen, doLogin, doForgotSendEmail, doResetPassword } =
    useAdminAuth();
  const { toast } = useAdminToast();

  const handleLogin = async (email: string, password: string) => {
    const ok = await doLogin(email, password);
    if (ok) {
      toast('Login successful!', 'success');
      setTimeout(onLoggedIn, 500);
    } else {
      toast('Login failed', 'error');
    }
    return ok;
  };

  const handleSendResetEmail = async (email: string) => {
    const ok = await doForgotSendEmail(email);
    if (ok) {
      toast('Password reset link sent to your email', 'success');
    } else {
      toast('Failed to send reset email', 'error');
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
          onSendResetEmail={handleSendResetEmail}
          onBack={() => showScreen('login')}
          error={error}
          loading={loading}
        />
      )}

      {currentScreen === 'reset' && (
        <ResetScreen onReset={handleReset} onBack={() => showScreen('login')} error={error} />
      )}
    </div>
  );
}
