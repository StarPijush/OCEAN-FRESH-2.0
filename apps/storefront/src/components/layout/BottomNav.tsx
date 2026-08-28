import { useLocation, useNavigate } from 'react-router-dom';

import { useCartStore } from '../../services/cart.service.js';
import Dock from '../navigation/Dock.js';
import { CartIcon, HouseIcon, MailIcon, PackageOpenIcon } from '../ui/Icons.js';

const tabs = [
  { id: 'home', label: 'Home', path: '/', Icon: HouseIcon },
  { id: 'products', label: 'Products', path: '/products', Icon: PackageOpenIcon },
  { id: 'order', label: 'Order', path: '/order', Icon: CartIcon },
  { id: 'contact', label: 'Contact', path: '/contact', Icon: MailIcon },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const count = useCartStore((s) => Object.values(s.items).reduce((a, b) => a + b, 0));

  const currentPath = location.pathname;
  const isLightPage = currentPath.startsWith('/products') || currentPath.startsWith('/order');

  const items = tabs.map((tab) => ({
    icon: <tab.Icon size={22} aria-hidden="true" />,
    label: tab.label,
    visLabel: tab.label,
    ariaLabel: `${tab.label}${tab.path === currentPath ? ', current page' : ''}`,
    active: tab.path === currentPath,
    badge: tab.id === 'order' ? count : undefined,
    onClick: () => navigate(tab.path),
    className: `dock-tab-${tab.id}`,
  }));

  return (
    <nav id="bottom-nav" aria-label="Primary">
      <Dock items={items} theme={isLightPage ? 'light' : 'dark'} />
    </nav>
  );
}
