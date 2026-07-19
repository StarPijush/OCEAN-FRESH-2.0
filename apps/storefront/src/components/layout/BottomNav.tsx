import { useLocation, useNavigate } from 'react-router-dom';

import { useCartStore } from '../../stores/cart.js';

const tabs = [
  { id: 'home', icon: '\u2302', label: 'Home', path: '/' },
  { id: 'products', icon: '\u{1F41F}', label: 'Products', path: '/products' },
  { id: 'order', icon: '\u{1F6D2}', label: 'Order', path: '/order' },
  { id: 'contact', icon: '\u2709', label: 'Contact', path: '/contact' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const count = useCartStore((s) => Object.values(s.items).reduce((a, b) => a + b, 0));

  const currentPath = location.pathname;

  return (
    <nav id="bottom-nav">
      {tabs.map((tab) => {
        const active = tab.path === currentPath;
        return (
          <div
            key={tab.id}
            className={`tab-item${active ? ' active' : ''}`}
            id={`tab-${tab.id}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'order' && (
              <div className={`tab-badge${count > 0 ? ' show' : ''}`} id="tab-order-badge">
                {count}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
