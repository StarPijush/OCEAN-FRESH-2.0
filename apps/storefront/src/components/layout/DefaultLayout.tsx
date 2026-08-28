import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useScrollNav } from '../../hooks/useScrollNav.js';
import { themeKeyForPath } from '../../theme/pageTheme.js';
import { CardNav, type CardNavItem } from '../navigation/CardNav.js';
import { FloatingWhatsApp } from '../ui/FloatingWhatsApp.js';
import { Toast } from '../ui/Toast.js';
import { BottomNav } from './BottomNav.js';

const NAV_ITEMS: CardNavItem[] = [
  {
    label: 'Explore',
    bgColor: '#0D2035',
    textColor: '#F2EEE6',
    links: [
      { label: 'Home', href: '/', ariaLabel: 'Go to Home' },
      { label: 'Our Story', href: '/contact', ariaLabel: 'Our Story and contact' },
    ],
  },
  {
    label: 'Shop',
    bgColor: '#0D2035',
    textColor: '#F2EEE6',
    links: [
      { label: 'All Products', href: '/products', ariaLabel: 'Browse all products' },
      { label: 'View Order', href: '/order', ariaLabel: 'View order' },
    ],
  },
  {
    label: 'Help',
    bgColor: '#0D2035',
    textColor: '#F2EEE6',
    links: [
      { label: 'Contact', href: '/contact', ariaLabel: 'Contact OceanFresh' },
      { label: 'Order Support', href: '/contact', ariaLabel: 'Order support' },
    ],
  },
];

export function DefaultLayout() {
  const location = useLocation();
  useScrollNav();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeKeyForPath(location.pathname));
  }, [location.pathname]);

  return (
    <>
      <CardNav items={NAV_ITEMS} ease="power3.out" />

      <Outlet />

      <BottomNav />
      <FloatingWhatsApp />
      <Toast />
    </>
  );
}
