import { useEffect, useState } from 'react';

interface LoaderProps {
  onComplete?: () => void;
  isLoading?: boolean;
}

export function Loader({ onComplete, isLoading }: LoaderProps) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const safety = setTimeout(() => {
      setHide(true);
    }, 8000);

    if (!isLoading) {
      clearTimeout(safety);
      const timer = setTimeout(() => {
        setHide(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        clearTimeout(safety);
      };
    }

    return () => clearTimeout(safety);
  }, [isLoading]);

  useEffect(() => {
    if (!hide || !onComplete) return;
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [hide, onComplete]);

  return (
    <div id="loader" className={hide ? 'hide' : ''}>
      <div className="loader-wordmark">OceanFresh</div>
      <div className="loader-sub">Premium Seafood &middot; Jhargram, West Bengal</div>
      <div className="loader-bar"></div>
    </div>
  );
}
