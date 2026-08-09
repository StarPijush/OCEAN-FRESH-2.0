import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useScrollNav } from '../../hooks/useScrollNav.js';
import { FloatingCart } from '../ui/FloatingCart.js';
import { FloatingWhatsApp } from '../ui/FloatingWhatsApp.js';
import { Toast } from '../ui/Toast.js';
import { BottomNav } from './BottomNav.js';
import { NavDrawer } from './NavDrawer.js';
import { TopNav } from './TopNav.js';

export function DefaultLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useScrollNav();

  return (
    <>
      <TopNav isDrawerOpen={drawerOpen} onMenuToggle={() => setDrawerOpen((v) => !v)} />
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Outlet />

      <BottomNav />
      <FloatingCart />
      <FloatingWhatsApp />
      <Toast />
    </>
  );
}
