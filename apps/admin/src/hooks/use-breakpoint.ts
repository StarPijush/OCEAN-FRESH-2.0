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
  const [width, setWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    width,
    isDesktop: width >= breakpoints.desktop,
    isTablet: width >= breakpoints.tablet,
  };
}
