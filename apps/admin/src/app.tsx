import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AccessDenied } from './components/AccessDenied';
import { SessionError } from './components/SessionError';
import { useAdminSession } from './hooks/use-auth-session';
import { AdminLayout } from './navigation/AdminLayout';
import { DashboardScreen } from './screens/DashboardScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { LoginScreen } from './screens/LoginScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { OtpVerifyScreen } from './screens/OtpVerifyScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { getAuthProvider } from './services/auth.service';

/**
 * Login stack. Only reachable while unauthenticated — any other URL is
 * redirected to /login so direct navigation and refresh land on the sign-in
 * screen (admin sessions are intentionally memory-only).
 */
function PublicRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/otp-verify" element={<OtpVerifyScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/** Admin drawer routes, only rendered for authenticated admins. */
function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/products" element={<ProductsScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

/**
 * Session gate:
 *   error           → SessionError (retry, never a silent logout)
 *   unauthenticated → login stack
 *   authenticated   → admin drawer (isAdmin) or AccessDenied
 */
export default function App() {
  const session = useAdminSession();
  const [signingOut, setSigningOut] = useState(false);

  if (session.status === 'error') {
    return <SessionError message={session.error} onRetry={session.retry} />;
  }

  if (session.status === 'unauthenticated') {
    return <PublicRoutes />;
  }

  if (session.isAdmin) {
    return <AdminRoutes />;
  }

  return (
    <AccessDenied
      signingOut={signingOut}
      onSignOut={() => {
        setSigningOut(true);
        void getAuthProvider()
          .logout()
          .finally(() => setSigningOut(false));
      }}
    />
  );
}
