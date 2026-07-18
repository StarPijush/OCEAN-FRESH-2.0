import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader } from '../ui/Loader.js';
import { Toast } from '../ui/Toast.js';
import { TopNav } from './TopNav.js';
import { NavDrawer } from './NavDrawer.js';
import { BottomNav } from './BottomNav.js';
import { FloatingCart } from '../ui/FloatingCart.js';
import { FloatingWhatsApp } from '../ui/FloatingWhatsApp.js';
import { useScrollNav } from '../../hooks/useScrollNav.js';

export function DefaultLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useScrollNav();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {loading && (
        <Loader onComplete={() => setLoading(false)} isLoading={true} />
      )}

      <div style={{ display: loading ? 'none' : undefined }}>
        <TopNav
          isDrawerOpen={drawerOpen}
          onMenuToggle={() => setDrawerOpen((v) => !v)}
        />
        <NavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <Outlet />

        <BottomNav />
        <FloatingCart />
        <FloatingWhatsApp />
        <Toast />
      </div>
    </>
  );
}
