import { useAdminSession } from '@oceanfresh/auth';
import { getAuthService } from '@oceanfresh/auth/service';
import { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import { AdminProvider } from './AdminContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AdminLayout() {
  const { status, isAdmin, error, retry } = useAdminSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleDeniedLogout = async () => {
    try {
      await getAuthService().logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // LOADING → wait for the auth state to resolve. Redirecting from here would
  // bounce authenticated users back to /login before their role is known.
  if (status === 'loading') {
    return (
      <div className="auth-shell">
        <div className="auth-bg" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">
            Ocean<span>Fresh</span>
          </div>
          <p className="auth-sub">Checking session…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="auth-shell">
        <div className="auth-bg" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">
            Ocean<span>Fresh</span>
          </div>
          <div className="auth-eyebrow">Session Error</div>
          <h2 className="auth-title" style={{ marginBottom: '4px' }}>
            Could not resolve your session
          </h2>
          <p className="auth-sub">{error || 'An unexpected error occurred.'}</p>
          <button className="btn btn-primary btn-full" onClick={retry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // UNAUTHENTICATED → no Supabase session exists; send to the login page.
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // AUTHENTICATED + NON-ADMIN → deny access without bouncing to /login.
  if (!isAdmin) {
    return (
      <div className="auth-shell">
        <div className="auth-bg" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">
            Ocean<span>Fresh</span>
          </div>
          <div className="auth-eyebrow">Access Denied</div>
          <h2 className="auth-title" style={{ marginBottom: '4px' }}>
            No admin access
          </h2>
          <p className="auth-sub">
            Your account is not registered as an administrator in admin_profiles, or your role is
            not granted admin access.
          </p>
          <button className="btn btn-primary btn-full" onClick={handleDeniedLogout}>
            Sign in with a different account
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminProvider>
      <Sidebar onNavigate={() => setSidebarOpen(false)} />
      <div
        id="sidebar-overlay"
        className={sidebarOpen ? 'show' : ''}
        onClick={() => setSidebarOpen(false)}
      />
      <div id="main-wrap">
        <Topbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <div id="page-container">
          <Outlet />
        </div>
      </div>
    </AdminProvider>
  );
}
