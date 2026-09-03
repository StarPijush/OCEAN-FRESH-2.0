import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCartStore } from '../../services/cart.service.js';
import { CartIcon } from '../ui/Icons.js';

interface TopNavProps {
  onMenuToggle: () => void;
  isDrawerOpen: boolean;
}

export function TopNav({ onMenuToggle, isDrawerOpen }: TopNavProps) {
  const navigate = useNavigate();
  const count = useCartStore((s) => Object.keys(s.items).length);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    setTheme(htmlTheme === 'products' || htmlTheme === 'orders' ? 'light' : 'dark');
  }, []);

  return (
    <header id="top-nav" className={theme === 'light' ? 'light' : ''}>
      <div className="nav-logo" onClick={() => navigate('/')}>
        OceanFresh
      </div>
      <div className="nav-right">
        <button className="nav-cart-btn" onClick={() => navigate('/order')} aria-label="Cart">
          <CartIcon size={22} />
          <span className={`nav-cart-count ${count > 0 ? 'show' : ''}`} id="nav-cart-count">
            {count}
          </span>
        </button>
        <button
          className={`nav-menu-btn ${isDrawerOpen ? 'open' : ''}`}
          id="menu-btn"
          onClick={onMenuToggle}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
