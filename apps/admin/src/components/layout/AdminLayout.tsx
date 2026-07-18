import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { authRepository } from '../../repositories';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AdminProvider } from './AdminContext';

export function AdminLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAuthed(authRepository.isLoggedIn());
  }, []);

  if (authed === null) return null;
  if (!authed) return <Navigate to="/login" replace />;

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <AdminProvider>
      <Sidebar onNavigate={closeSidebar} />
      <div
        id="sidebar-overlay"
        className={sidebarOpen ? 'show' : ''}
        onClick={closeSidebar}
      />
      <div id="main-wrap">
        <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <div id="page-container">
          <Outlet />
        </div>
      </div>
    </AdminProvider>
  );
}
