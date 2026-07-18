import { useEffect } from 'react';

export function useScrollNav() {
  useEffect(() => {
    const nav = document.getElementById('top-nav');

    if (!nav) return;

    const handler = () => {
      const page = document.querySelector('.page.active');
      if (page && page.id === 'page-home') {
        nav.classList.toggle('light', window.scrollY > window.innerHeight * 0.7);
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
}
