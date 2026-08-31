import { useEffect, useState } from 'react';

import { breakpoints } from '../theme/new';

export interface Viewport {
  width: number;
  /** Width at which the admin sidebar becomes permanent. */
  isDesktop: boolean;
  /** Width at which bottom sheets become centered dialogs. */
  isTablet: boolean;
}

/** Browser viewport width with the same thresholds the RN app used. */
export function useBreakpoint(): Viewport {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return breakpoints.desktop;
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(min-width: 1024px)').matches ? breakpoints.desktop : 0;
    }
    return window.innerWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      const onResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setWidth(e.matches ? breakpoints.desktop : 0);
    // set initial from mql in case hydration mismatch
    setWidth(mql.matches ? breakpoints.desktop : window.innerWidth);
    mql.addEventListener('change', onChange);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => {
      mql.removeEventListener('change', onChange);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return {
    width,
    isDesktop: width >= breakpoints.desktop,
    isTablet: width >= breakpoints.tablet,
  };
}
