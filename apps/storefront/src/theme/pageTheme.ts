export type PageTheme = {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentGlow: string;
};

export const pageThemes: Record<'home' | 'products' | 'orders' | 'contact', PageTheme> = {
  home: {
    accent: '#21C8C8',
    accentSoft: 'rgba(33,200,200,0.10)',
    accentBorder: 'rgba(33,200,200,0.25)',
    accentGlow: 'rgba(33,200,200,0.12)',
  },
  products: {
    accent: '#38BDF8',
    accentSoft: 'rgba(56,189,248,0.10)',
    accentBorder: 'rgba(56,189,248,0.25)',
    accentGlow: 'rgba(56,189,248,0.12)',
  },
  orders: {
    accent: '#22C55E',
    accentSoft: 'rgba(34,197,94,0.10)',
    accentBorder: 'rgba(34,197,94,0.25)',
    accentGlow: 'rgba(34,197,94,0.12)',
  },
  contact: {
    accent: '#38BDF8',
    accentSoft: 'rgba(56,189,248,0.10)',
    accentBorder: 'rgba(56,189,248,0.25)',
    accentGlow: 'rgba(56,189,248,0.12)',
  },
};

export function themeKeyForPath(pathname: string): keyof typeof pageThemes {
  if (pathname.startsWith('/products')) return 'products';
  if (pathname.startsWith('/order')) return 'orders';
  if (pathname.startsWith('/contact')) return 'contact';
  return 'home';
}

export function themeForPath(pathname: string): PageTheme {
  return pageThemes[themeKeyForPath(pathname)];
}
