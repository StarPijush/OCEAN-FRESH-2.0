import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AdminNavigation } from '../../components/navigation/AdminNavigation';
import { STOREFRONT_URL } from '../../env';
import { useAdminSession } from '../../hooks/use-auth-session';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { usePendingOrderCount } from '../../hooks/use-orders';
import { ADMIN_NAV_CARDS, isAdminPathActive } from '../../hooks/useAdminNav';
import { getAuthProvider } from '../../services/auth.service';

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate: (href: string, external?: boolean) => void;
}) {
  const session = useAdminSession();
  const { data: pendingCount = 0 } = usePendingOrderCount();
  const location = useLocation();
  const name = session.adminProfile?.fullName || session.user?.email || 'Admin';
  const email = session.user?.email ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <div
        style={{
          padding: '24px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#071526',
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#4ab8c1',
            lineHeight: 1,
            fontWeight: 600,
          }}
        >
          Ocean<span style={{ color: '#FFFFFF' }}>Fresh</span>
        </div>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#879A91',
            marginTop: 6,
            fontWeight: 700,
          }}
        >
          Private Operations
        </div>
      </div>

      <nav
        aria-label="Admin navigation"
        style={{ flex: 1, padding: '20px 16px 12px', overflowY: 'auto', minHeight: 0 }}
      >
        {ADMIN_NAV_CARDS.map((card) => (
          <div key={card.label} style={{ marginBottom: 22 }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.70rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#879A91',
                opacity: 0.6,
                padding: '0 10px 10px',
              }}
            >
              {card.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {card.links.map((lnk) => {
                const href = lnk.external && lnk.href === '/' ? STOREFRONT_URL || '/' : lnk.href;
                const active = !lnk.external && isAdminPathActive(lnk.href, location.pathname);
                return (
                  <button
                    key={lnk.label}
                    type="button"
                    onClick={() => onNavigate(href, lnk.external)}
                    aria-current={active ? 'page' : undefined}
                    tabIndex={0}
                    style={{
                      display: 'flex',
                      position: 'relative',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '10px 12px',
                      border: '1px solid transparent',
                      borderRadius: 10,
                      background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                      borderColor: active ? 'transparent' : 'transparent',
                      color: active ? '#FFFFFF' : '#879A91',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {/* Spark active lime bar → aqua */}
                    {active ? (
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          left: -16,
                          top: '15%',
                          height: '70%',
                          width: 4,
                          background: '#4ab8c1',
                          borderRadius: '0 4px 4px 0',
                        }}
                      />
                    ) : null}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Icon
                        name={
                          lnk.label === 'Dashboard'
                            ? 'grid-outline'
                            : lnk.label === 'Products'
                              ? 'fish-outline'
                              : lnk.label === 'Categories'
                                ? 'folder-outline'
                                : lnk.label === 'Orders'
                                  ? 'receipt-outline'
                                  : lnk.label === 'Settings'
                                    ? 'settings-outline'
                                    : 'open-outline'
                        }
                        size={16}
                        color={active ? '#4ab8c1' : '#879A91'}
                      />
                      <span
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {lnk.label}
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {lnk.label === 'Orders' && pendingCount > 0 ? (
                        <span
                          style={{
                            background: '#4ab8c1',
                            color: '#071526',
                            borderRadius: 20,
                            padding: '2px 7px',
                            fontSize: 10,
                            fontWeight: 800,
                            minWidth: 18,
                            textAlign: 'center',
                            lineHeight: 1.4,
                          }}
                        >
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                      ) : null}
                      <svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{
                          opacity: active ? 1 : 0.5,
                          color: active ? '#4ab8c1' : '#879A91',
                        }}
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: '#071526',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            {initialsOf(name)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: '#879A91',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void getAuthProvider().logout()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            color: '#879A91',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 11,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Icon name="log-out-outline" size={16} color="#879A91" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function DesktopHeader() {
  const location = useLocation();
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/products': 'Products',
    '/categories': 'Categories',
    '/orders': 'Orders',
    '/settings': 'Settings',
  };
  const title = titles[location.pathname] ?? 'Dashboard';
  const [date, setDate] = useState('');
  useEffect(() => {
    const upd = () =>
      setDate(
        new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
      );
    upd();
    const id = setInterval(upd, 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <header
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#F4F6F5',
        borderBottom: '1px solid rgba(11,19,15,0.06)',
        flexShrink: 0,
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#0B130F',
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12,
            color: '#6C7E75',
            fontWeight: 500,
          }}
        >
          {date}
        </span>
        <span
          aria-label="Live"
          title="Live"
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: '#22C55E',
            display: 'inline-block',
            boxShadow: '0 0 8px rgba(34,197,94,0.45)',
            animation: 'pulse 2s infinite',
          }}
        />
      </div>
    </header>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint();

  const handleNav = (href: string, external?: boolean) => {
    if (external) {
      if (href) window.open(href, '_blank', 'noopener');
      return;
    }
    navigate(href);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#F4F6F5',
      }}
    >
      <AdminNavigation />

      {isDesktop ? (
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            height: '100vh',
            overflowY: 'auto',
            background: '#071526',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 72,
          }}
        >
          <SidebarContent onNavigate={handleNav} />
        </aside>
      ) : null}

      <div
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}
      >
        {isDesktop ? (
          <DesktopHeader />
        ) : (
          <div style={{ height: 72, flexShrink: 0 }} aria-hidden="true" />
        )}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--color-border2, rgba(255,255,255,0.12)) transparent',
            paddingTop: isDesktop ? 0 : 0,
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
