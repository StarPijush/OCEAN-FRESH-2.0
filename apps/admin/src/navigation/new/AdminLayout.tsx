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
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--grid-dark, rgba(39,195,200,0.055))',
          background: 'var(--color-navy-deep, #071526)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display, Cormorant Garamond, Georgia, serif)',
            fontSize: 22,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-champagne, #d8c7a6)',
            lineHeight: 1,
          }}
        >
          Ocean<span style={{ color: 'var(--color-teal, #27c3c8)' }}>Fresh</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-ui, Instrument Sans, sans-serif)',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted, #8291a5)',
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          Private Operations
        </div>
      </div>

      <nav
        aria-label="Admin navigation"
        style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', minHeight: 0 }}
      >
        {ADMIN_NAV_CARDS.map((card) => (
          <div key={card.label} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontFamily: 'var(--font-ui, Instrument Sans, sans-serif)',
                fontSize: '0.66rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-teal, #27c3c8)',
                opacity: 0.9,
                padding: '8px 10px 6px',
              }}
            >
              {card.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '9px 10px',
                      border: '1px solid transparent',
                      borderRadius: 8,
                      background: active ? 'rgba(39,195,200,0.08)' : 'transparent',
                      borderColor: active ? 'rgba(39,195,200,0.18)' : 'transparent',
                      color: active
                        ? 'var(--color-teal, #27c3c8)'
                        : 'var(--color-text-primary, #f2eee6)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 150ms var(--ease-out)',
                      fontFamily: 'var(--font-ui, Instrument Sans, sans-serif)',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                    }}
                  >
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
                        color={
                          active
                            ? 'var(--color-teal, #27c3c8)'
                            : 'var(--color-text-secondary, #aeb9c8)'
                        }
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
                            background: 'var(--color-warn, #e07a65)',
                            color: '#fff',
                            borderRadius: 20,
                            padding: '1px 7px',
                            fontSize: 10,
                            fontWeight: 700,
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
                          opacity: 0.75,
                          color: active
                            ? 'var(--color-teal, #27c3c8)'
                            : 'var(--color-text-secondary, #aeb9c8)',
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
          borderTop: '1px solid var(--grid-dark, rgba(39,195,200,0.055))',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'var(--color-navy-deep, #071526)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: 'rgba(39,195,200,0.10)',
              border: '1px solid var(--color-teal, #27c3c8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-teal, #27c3c8)',
            }}
          >
            {initialsOf(name)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-primary, #f2eee6)',
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
                color: 'var(--color-text-muted, #8291a5)',
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
            border: '1px solid var(--color-border2, rgba(255,255,255,0.12))',
            borderRadius: 8,
            background: 'transparent',
            color: 'var(--color-muted2, #9ca3af)',
            fontFamily: 'var(--font-ui, Instrument Sans, sans-serif)',
            fontSize: 11,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Icon name="log-out-outline" size={16} color="var(--color-muted2)" />
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
        background: 'var(--color-navy-deep, #071526)',
        borderBottom: '1px solid var(--grid-dark, rgba(39,195,200,0.055))',
        flexShrink: 0,
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-display, Cormorant Garamond, Georgia, serif)',
            fontSize: 22,
            color: 'var(--color-text-primary, #f2eee6)',
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted, #8291a5)' }}>{date}</span>
        <span
          aria-label="Live"
          title="Live"
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'var(--color-green, #4ade80)',
            display: 'inline-block',
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
        background: 'var(--color-bg, #0d0f12)',
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
            background: 'var(--color-navy-deep, #071526)',
            borderRight: '1px solid var(--grid-dark, rgba(39,195,200,0.055))',
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
