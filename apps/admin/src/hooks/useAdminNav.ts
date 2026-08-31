import { useLocation } from 'react-router-dom';

export interface AdminNavLinkDef {
  label: string;
  href: string;
  ariaLabel?: string;
  external?: boolean;
}

export interface AdminNavCardDef {
  label: string;
  bgColor: string;
  textColor: string;
  links: AdminNavLinkDef[];
}

export const ADMIN_NAV_CARDS: readonly AdminNavCardDef[] = [
  {
    label: 'Overview',
    bgColor: '#0D2035',
    textColor: '#F2EEE6',
    links: [{ label: 'Dashboard', href: '/dashboard', ariaLabel: 'Go to Dashboard' }],
  },
  {
    label: 'Catalog',
    bgColor: '#0D2035',
    textColor: '#F2EEE6',
    links: [
      { label: 'Products', href: '/products', ariaLabel: 'Manage products' },
      { label: 'Categories', href: '/categories', ariaLabel: 'Manage categories' },
    ],
  },
  {
    label: 'Operations',
    bgColor: '#0D2035',
    textColor: '#F2EEE6',
    links: [
      { label: 'Orders', href: '/orders', ariaLabel: 'View orders' },
      { label: 'Settings', href: '/settings', ariaLabel: 'Manage settings' },
      { label: 'View Store', href: '/', ariaLabel: 'View storefront', external: true },
    ],
  },
] as const;

export function isAdminPathActive(href: string, pathname: string): boolean {
  if (!href) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function useAdminActiveMap() {
  const { pathname } = useLocation();
  return ADMIN_NAV_CARDS.map((card) => ({
    ...card,
    links: card.links.map((l) => ({
      ...l,
      active: !l.external && isAdminPathActive(l.href, pathname),
    })),
  }));
}
