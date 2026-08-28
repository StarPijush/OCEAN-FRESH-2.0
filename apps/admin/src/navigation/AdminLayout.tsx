import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppText } from '../components/AppText';
import { Icon, type IconName } from '../components/Icon';
import { STOREFRONT_URL } from '../env';
import { useAdminSession } from '../hooks/use-auth-session';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { usePendingOrderCount } from '../hooks/use-orders';
import { getAuthProvider } from '../services/auth.service';
import { colors, radius, spacing } from '../theme';

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
    label: 'Main',
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
    label: 'Manage',
    items: [
      {
        id: 'Products',
        path: '/products',
        label: 'Products',
        icon: 'fish-outline',
        activeIcon: 'fish',
      },
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

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Focus trap hook for mobile drawer
function useFocusTrap(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
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
      className="of-nav-item"
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: spacing.md,
        padding: `${spacing.md + 2}px ${spacing.lg}px`,
        borderRadius: radius.md,
        border: 'none',
        borderLeft: `2px solid ${active ? colors.aqua : 'transparent'}`,
        backgroundColor: active ? colors.aquaDim : 'transparent',
        color: active ? colors.aqua : colors.mutedBright,
        textAlign: 'left',
      }}
    >
      <Icon
        name={active ? item.activeIcon : item.icon}
        size={18}
        color={active ? colors.aqua : colors.mutedBright}
      />
      <AppText variant="bodyMedium" color={active ? 'aqua' : 'mutedBright'} style={{ flex: 1 }}>
        {item.label}
      </AppText>
      {item.badge && pendingCount > 0 ? (
        <span
          style={{
            backgroundColor: colors.warn,
            borderRadius: radius.full,
            padding: '1px 8px',
          }}
        >
          <AppText variant="caption" style={{ color: colors.white, fontWeight: '700' }}>
            {pendingCount > 99 ? '99+' : pendingCount}
          </AppText>
        </span>
      ) : null}
    </button>
  );
}

interface SidebarContentProps {
  onNavigate: (id: NavId) => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const session = useAdminSession();
  const { data: pendingCount = 0 } = usePendingOrderCount();
  const location = useLocation();
  const name = session.adminProfile?.fullName || session.user?.email || 'Admin';
  const email = session.user?.email ?? '';
  const current = location.pathname;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <div
        style={{
          padding: `${spacing.sm}px ${spacing.xl}px ${spacing.lg}px`,
          gap: 2,
        }}
      >
        <AppText
          variant="title"
          style={{ fontSize: 22, letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          Ocean
          <AppText
            variant="title"
            style={{
              fontSize: 22,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: colors.aqua,
            }}
          >
            Fresh
          </AppText>
        </AppText>
        <AppText
          variant="caption"
          color="muted"
          style={{ letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 2 }}
        >
          Admin Panel
        </AppText>
      </div>

      <nav
        aria-label="Admin navigation"
        style={{ flex: 1, padding: `0 ${spacing.sm}px`, overflowY: 'auto', minHeight: 0 }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <AppText
              variant="caption"
              color="muted"
              style={{
                letterSpacing: 1.8,
                textTransform: 'uppercase',
                padding: `${spacing.lg}px ${spacing.lg}px ${spacing.xs}px`,
              }}
            >
              {section.label.toUpperCase()}
            </AppText>
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
          borderTop: `1px solid ${colors.border}`,
          padding: spacing.lg,
          gap: spacing.md,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.aquaDim,
              border: `1px solid ${colors.aqua}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AppText variant="label" style={{ color: colors.aqua, fontWeight: '600' }}>
              {initialsOf(name)}
            </AppText>
          </div>
          <div style={{ flex: 1, minWidth: 0, gap: 1 }}>
            <AppText
              variant="bodyMedium"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {name}
            </AppText>
            <AppText
              variant="caption"
              color="muted"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {email}
            </AppText>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void getAuthProvider().logout()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            padding: `${spacing.md}px`,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: radius.md,
            backgroundColor: 'transparent',
            color: colors.mutedBright,
          }}
        >
          <Icon name="log-out-outline" size={16} color={colors.mutedBright} />
          <AppText
            variant="label"
            color="mutedBright"
            style={{ letterSpacing: 1.6, textTransform: 'uppercase' }}
          >
            SIGN OUT
          </AppText>
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
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${spacing.lg}px`,
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${colors.borderSubtle}`,
        flexShrink: 0,
        gap: spacing.md,
      }}
    >
      <AppText variant="title" style={{ fontSize: 18, letterSpacing: 0.4 }}>
        {title}
      </AppText>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <AppText variant="caption" color="muted">
          {date}
        </AppText>
        <span
          aria-label="Live"
          title="Live"
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: colors.green,
            display: 'inline-block',
            animation: 'of-pulse-dot 2s infinite',
          }}
        />
      </div>
    </header>
  );
}

/** Lightweight mobile header: hamburger · brand · status. */
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
    const updateDate = () => {
      setCurrentDate(
        new Date().toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      );
    };
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
        gap: spacing.md,
        height: 56,
        padding: `0 ${spacing.md}px`,
        backgroundColor: colors.bg,
        borderBottom: `1px solid ${colors.borderSubtle}`,
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
          borderRadius: radius.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderStrong}`,
          color: colors.cream,
        }}
      >
        <Icon name={drawerOpen ? 'close' : 'menu'} size={26} color={colors.cream} />
      </button>
      <AppText
        variant="title"
        style={{ fontSize: 18, letterSpacing: 1, textTransform: 'uppercase' }}
      >
        Ocean
        <AppText
          variant="title"
          style={{ fontSize: 18, letterSpacing: 1, textTransform: 'uppercase', color: colors.aqua }}
        >
          Fresh
        </AppText>
      </AppText>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          minWidth: 80,
          justifyContent: 'flex-end',
        }}
      >
        {pendingCount > 0 ? (
          <div
            role="status"
            aria-label={`${pendingCount} orders pending`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              minWidth: 44,
              justifyContent: 'flex-end',
            }}
          >
            <Icon name="alert-circle" size={16} color={colors.gold} />
            <AppText variant="caption" color="gold" style={{ fontWeight: '700' }}>
              {pendingCount}
            </AppText>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 44,
              justifyContent: 'flex-end',
            }}
          >
            <Icon name="checkmark-circle" size={16} color={colors.green} />
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: radius.full,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
            marginLeft: spacing.sm,
          }}
        >
          <Icon name="calendar-outline" size={14} color={colors.mutedBright} />
          <AppText variant="caption" color="mutedBright">
            {currentDate}
          </AppText>
        </div>
      </div>
    </header>
  );
}

/**
 * Admin shell: permanent sidebar on desktop, overlay drawer on mobile.
 * The drawer is closed by default on mobile; it closes on navigation,
 * Escape and outside click, swipe-to-close, and locks background scrolling while open.
 */
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

  // Close the drawer with Escape (mobile only).
  useEffect(() => {
    if (isDesktop) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDesktop]);

  // Background scroll lock while the drawer is open.
  useEffect(() => {
    if (isDesktop || !drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDesktop, drawerOpen]);

  // Swipe-to-close gesture
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
    if (deltaX < 0 && drawerRef.current) {
      // Only allow swiping right-to-left (closing)
      drawerRef.current.style.transform = `translateX(${deltaX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (isDesktop || !drawerOpen || !isDragging.current) return;
    isDragging.current = false;
    const deltaX = touchCurrentX.current - touchStartX.current;
    const threshold = 100; // Minimum swipe distance to close

    if (deltaX < -threshold) {
      setDrawerOpen(false);
    } else if (drawerRef.current) {
      // Snap back
      drawerRef.current.style.transform = '';
    }
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
    <div className="of-layout">
      {isDesktop ? (
        <aside className="of-sidebar">
          <SidebarContent onNavigate={handleNav} />
        </aside>
      ) : null}

      <div className="of-main">
        {isDesktop ? (
          <DesktopHeader />
        ) : (
          <MobileHeader
            onToggle={() => setDrawerOpen((open) => !open)}
            pendingCount={pendingCount}
            drawerOpen={drawerOpen}
          />
        )}
        <main className="of-content">
          <Outlet />
        </main>
      </div>

      {!isDesktop ? (
        <>
          <div
            className={`of-drawer-overlay${drawerOpen ? ' open' : ''}`}
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={(el) => {
              drawerRef.current = el;
              if (drawerContainerRef.current) drawerContainerRef.current = el;
            }}
            className={`of-drawer${drawerOpen ? ' open' : ''}`}
            aria-hidden={!drawerOpen}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              // Smooth transition when not dragging
              transition: isDragging.current ? 'none' : 'transform var(--of-motion) ease',
            }}
          >
            {/* Drag handle for bottom-sheet feel */}
            <div
              className="of-drawer-handle"
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.borderStrong,
                margin: `${spacing.md}px auto ${spacing.sm}px`,
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
