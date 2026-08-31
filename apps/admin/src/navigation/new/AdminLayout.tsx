import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Icon, type IconName } from '../../components/Icon';
import { STOREFRONT_URL } from '../../env';
import { useAdminSession } from '../../hooks/use-auth-session';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { usePendingOrderCount } from '../../hooks/use-orders';
import { getAuthProvider } from '../../services/auth.service';

interface NavItemDef {
  id: string;
  path: string | null;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  badge?: boolean;
}

interface NavSection {
  label: string;
  items: readonly NavItemDef[];
}

const NAV_SECTIONS: readonly NavSection[] = [
  {
    label: 'Overview',
    items: [
      {
        id: 'Dashboard',
        path: '/dashboard',
        label: 'Dashboard',
        icon: 'grid-outline',
        activeIcon: 'grid',
      },
    ],
  },
  {
    label: 'Catalog',
    items: [
      {
        id: 'Products',
        path: '/products',
        label: 'Products',
        icon: 'fish-outline',
        activeIcon: 'fish',
      },
      {
        id: 'Categories',
        path: '/categories',
        label: 'Categories',
        icon: 'folder-outline',
        activeIcon: 'folder-outline',
      },
    ],
  },
  {
    label: 'Orders',
    items: [
      {
        id: 'Orders',
        path: '/orders',
        label: 'Orders',
        icon: 'receipt-outline',
        activeIcon: 'receipt',
        badge: true,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        id: 'Settings',
        path: '/settings',
        label: 'Settings',
        icon: 'settings-outline',
        activeIcon: 'settings',
      },
      { id: '__store', path: null, label: 'View Store', icon: 'open-outline', activeIcon: 'open' },
    ],
  },
];

type NavId = (typeof NAV_SECTIONS)[number]['items'][number]['id'];

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function useFocusTrap(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const container = containerRef.current;
    previousActiveElement.current = document.activeElement as HTMLElement;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    firstElement?.focus();
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
    container.addEventListener('keydown', handleTab);
    return () => {
      container.removeEventListener('keydown', handleTab);
      previousActiveElement.current?.focus();
    };
  }, [enabled]);

  return containerRef;
}

function NavItem({
  item,
  active,
  pendingCount,
  onPress,
}: {
  item: NavItemDef;
  active: boolean;
  pendingCount: number;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        border: 'none',
        borderLeft: `2px solid ${active ? 'var(--color-aqua)' : 'transparent'}`,
        background: active ? 'var(--color-aqua-dim)' : 'transparent',
        color: active ? 'var(--color-aqua)' : 'var(--color-muted2)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 150ms var(--ease-out)',
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        fontWeight: 500,
      }}
    >
      <Icon
        name={active ? item.activeIcon : item.icon}
        size={18}
        color={active ? 'var(--color-aqua)' : 'var(--color-muted2)'}
      />
      <span style={{ flex: 1, color: active ? 'var(--color-cream)' : undefined }}>
        {item.label}
      </span>
      {item.badge && pendingCount > 0 ? (
        <span
          style={{
            background: 'var(--color-warn)',
            color: '#fff',
            borderRadius: 20,
            padding: '1px 8px',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      ) : null}
    </button>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const session = useAdminSession();
  const { data: pendingCount = 0 } = usePendingOrderCount();
  const location = useLocation();
  const name = session.adminProfile?.fullName || session.user?.email || 'Admin';
  const email = session.user?.email ?? '';
  const current = location.pathname;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-cream)',
          }}
        >
          Ocean<span style={{ color: 'var(--color-aqua)' }}>Fresh</span>
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            marginTop: 4,
          }}
        >
          Admin Panel
        </div>
      </div>

      <nav
        aria-label="Admin navigation"
        style={{ flex: 1, padding: '0 8px', overflowY: 'auto', minHeight: 0 }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                padding: '16px 20px 4px',
                fontWeight: 600,
              }}
            >
              {section.label.toUpperCase()}
            </div>
            {section.items.map((item) => {
              const active = item.path !== null && current === item.path;
              return (
                <NavItem
                  key={item.id}
                  item={item}
                  active={active}
                  pendingCount={pendingCount}
                  onPress={() => onNavigate(item.id)}
                />
              );
            })}
          </div>
        ))}
      </nav>

      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: 'var(--color-aqua-dim)',
              border: '1px solid var(--color-aqua)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-aqua)',
            }}
          >
            {initialsOf(name)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-cream)',
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
                color: 'var(--color-muted)',
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
            border: '1px solid var(--color-border2)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-muted2)',
            fontFamily: 'var(--font-ui)',
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
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-cream)' }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{date}</span>
        <span
          aria-label="Live"
          title="Live"
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'var(--color-green)',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }}
        />
      </div>
    </header>
  );
}

function MobileHeader({
  onToggle,
  pendingCount,
  drawerOpen,
}: {
  onToggle: () => void;
  pendingCount: number;
  drawerOpen: boolean;
}) {
  const [currentDate, setCurrentDate] = useState('');
  useEffect(() => {
    const updateDate = () =>
      setCurrentDate(
        new Date().toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      );
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        height: 56,
        padding: '0 12px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={drawerOpen}
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface2)',
          border: '1px solid var(--color-border2)',
          color: 'var(--color-cream)',
          cursor: 'pointer',
        }}
      >
        <Icon name={drawerOpen ? 'close' : 'menu'} size={26} color="var(--color-cream)" />
      </button>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--color-cream)',
        }}
      >
        Ocean<span style={{ color: 'var(--color-aqua)' }}>Fresh</span>
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 80,
          justifyContent: 'flex-end',
        }}
      >
        {pendingCount > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="alert-circle" size={16} color="var(--color-gold)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-gold)' }}>
              {pendingCount}
            </span>
          </div>
        ) : (
          <Icon name="checkmark-circle" size={16} color="var(--color-green)" />
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-surface2)',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            padding: '6px 12px',
          }}
        >
          <Icon name="calendar-outline" size={14} color="var(--color-muted2)" />
          <span style={{ fontSize: 11, color: 'var(--color-muted2)', fontWeight: 500 }}>
            {currentDate}
          </span>
        </div>
      </div>
    </header>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint();
  const { data: pendingCount = 0 } = usePendingOrderCount();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isDragging = useRef(false);

  const drawerContainerRef = useFocusTrap(drawerOpen);

  useEffect(() => {
    if (isDesktop) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop || !drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDesktop, drawerOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDesktop || !drawerOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = true;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDesktop || !drawerOpen || !isDragging.current) return;
    touchCurrentX.current = e.touches[0].clientX;
    const deltaX = touchCurrentX.current - touchStartX.current;
    if (deltaX < 0 && drawerRef.current)
      drawerRef.current.style.transform = `translateX(${deltaX}px)`;
  };
  const handleTouchEnd = () => {
    if (isDesktop || !drawerOpen || !isDragging.current) return;
    isDragging.current = false;
    const deltaX = touchCurrentX.current - touchStartX.current;
    if (deltaX < -100) setDrawerOpen(false);
    else if (drawerRef.current) drawerRef.current.style.transform = '';
  };

  const handleNav = (id: NavId) => {
    if (id === '__store') {
      if (STOREFRONT_URL) window.open(STOREFRONT_URL, '_blank', 'noopener');
      return;
    }
    const item = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.id === id);
    if (item?.path) navigate(item.path);
    setDrawerOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--color-bg)',
      }}
    >
      {isDesktop ? (
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            height: '100vh',
            overflowY: 'auto',
            background: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
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
          <MobileHeader
            onToggle={() => setDrawerOpen((open) => !open)}
            pendingCount={pendingCount}
            drawerOpen={drawerOpen}
          />
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
            scrollbarColor: 'var(--color-border2) transparent',
          }}
        >
          <Outlet />
        </main>
      </div>

      {!isDesktop ? (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 40,
              opacity: drawerOpen ? 1 : 0,
              pointerEvents: drawerOpen ? 'auto' : 'none',
              transition: 'opacity 200ms ease',
            }}
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={(el) => {
              drawerRef.current = el;
              if (drawerContainerRef.current)
                drawerContainerRef.current = el as unknown as HTMLDivElement;
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 264,
              maxWidth: '100vw',
              background: 'var(--color-surface)',
              zIndex: 41,
              transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: isDragging.current ? 'none' : 'transform 200ms ease',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            aria-hidden={!drawerOpen}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: 'var(--color-border2)',
                margin: '12px auto 8px',
                cursor: 'grab',
              }}
            />
            <SidebarContent onNavigate={handleNav} />
          </div>
        </>
      ) : null}
    </div>
  );
}
