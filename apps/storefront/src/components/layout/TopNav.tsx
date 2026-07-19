import { useLocation, useNavigate } from 'react-router-dom';

import { useCartStore } from '../../stores/cart.js';

interface TopNavProps {
  onMenuToggle: () => void;
  isDrawerOpen: boolean;
}

export function TopNav({ onMenuToggle, isDrawerOpen }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const count = useCartStore((s) => Object.values(s.items).reduce((a, b) => a + b, 0));

  const isHome = location.pathname === '/';

  return (
    <header id="top-nav" className={!isHome ? 'light' : undefined}>
      <div className="nav-logo" onClick={() => navigate('/')}>
        OceanFresh
      </div>
      <div className="nav-right">
        <button className="nav-cart-btn" onClick={() => navigate('/order')} aria-label="Cart">
          {'\u{1F6D2}'}
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
