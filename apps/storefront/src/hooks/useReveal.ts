import { useEffect, useRef } from 'react';

export function useReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('in'), i * 80);
            observerRef.current?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    els.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);
}
