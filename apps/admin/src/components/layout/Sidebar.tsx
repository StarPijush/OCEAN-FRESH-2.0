import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { authRepository } from '../../repositories';
import { useAdminContext } from './AdminContext';

interface Props {
  onNavigate: () => void;
}

const navItems = [
  { section: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: '▦' }] },
  {
    section: 'Manage',
    items: [
      { id: 'products', label: 'Products', icon: '🐟' },
      { id: 'orders', label: 'Orders', icon: '📦', badge: true },
    ],
  },
  {
    section: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: '⚙' },
      { id: 'store', label: 'View Store', icon: '🌐' },
    ],
  },
];

export function Sidebar({ onNavigate }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.replace('/', '') || 'dashboard';
  const [admin, setAdmin] = useState({ name: 'Shop Owner', mobile: '9876543210' });
  const { pendingCount } = useAdminContext();

  useEffect(() => {
    authRepository.getAdmin().then((a) => {
      if (a) setAdmin(a);
    });
  }, [location.pathname]);

  const initials = admin.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleNav = (id: string) => {
    if (id === 'store') {
      window.open('/', '_blank');
      return;
    }
    onNavigate();
    navigate(`/${id}`);
  };

  const handleLogout = async () => {
    await authRepository.logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside id="sidebar" className="desktop">
      <div className="sb-head">
        <div className="sb-logo">
          Ocean<span>Fresh</span>
        </div>
        <div className="sb-role">Admin Panel</div>
      </div>

      <nav className="sb-nav">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="sb-section-label">{group.section}</div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className={`sb-item ${current === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                <span className="sb-item-icon">{item.icon}</span>
                {item.label}
                {item.badge && pendingCount > 0 && (
                  <span className="sb-badge" id="pending-badge">
                    {pendingCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="sb-user">
          <div className="sb-avatar" id="sb-initials">
            {initials}
          </div>
          <div>
            <div className="sb-username" id="sb-name">
              {admin.name}
            </div>
            <div className="sb-mobile" id="sb-mobile">
              {admin.mobile}
            </div>
          </div>
        </div>
        <button className="sb-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
