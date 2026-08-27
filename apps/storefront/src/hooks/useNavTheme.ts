import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type NavTheme = 'dark' | 'light';

function computeTheme(pathname: string): NavTheme {
  const isHomeRoute = pathname === '/';
  const page = document.querySelector('.page.active');
  const isHome = isHomeRoute && (!page || page.id === 'page-home');
  if (isHome) {
    return window.scrollY > window.innerHeight * 0.7 ? 'light' : 'dark';
  }
  return 'light';
}

export function useNavTheme(): NavTheme {
  const location = useLocation();
  const [theme, setTheme] = useState<NavTheme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return computeTheme(location.pathname);
  });

  useEffect(() => {
    let ticking = false;
    const update = () => {
      setTheme(computeTheme(location.pathname));
      ticking = false;
    };
    const handler = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [location.pathname]);

  return theme;
}
