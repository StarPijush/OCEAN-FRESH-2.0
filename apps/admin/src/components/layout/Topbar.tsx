import { useLocation } from 'react-router-dom';

interface Props {
  onMenuToggle: () => void;
}

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  settings: 'Settings',
};

export function Topbar({ onMenuToggle }: Props) {
  const location = useLocation();
  const current = location.pathname.replace('/', '') || 'dashboard';
  const title = titles[current] || 'Dashboard';

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div id="topbar">
      <button id="topbar-hamburger" aria-label="Menu" onClick={onMenuToggle}>
        <span /><span /><span />
      </button>
      <div className="topbar-title" id="topbar-title">{title}</div>
      <div className="topbar-right">
        <div className="topbar-date" id="topbar-date">{dateStr}</div>
        <div className="topbar-dot" title="Live" />
      </div>
    </div>
  );
}
