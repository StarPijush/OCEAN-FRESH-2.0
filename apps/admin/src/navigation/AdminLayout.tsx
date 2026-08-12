import { useEffect, useState } from 'react';
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
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open navigation menu"
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
        <Icon name="menu" size={26} color={colors.cream} />
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
    </header>
  );
}

/**
 * Admin shell: permanent sidebar on desktop, overlay drawer on mobile.
 * The drawer is closed by default on mobile; it closes on navigation,
 * Escape and outside click, and locks background scrolling while open.
 */
export function AdminLayout() {
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint();
  const { data: pendingCount = 0 } = usePendingOrderCount();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        {!isDesktop ? (
          <MobileHeader
            onToggle={() => setDrawerOpen((open) => !open)}
            pendingCount={pendingCount}
            drawerOpen={drawerOpen}
          />
        ) : null}
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
          <div className={`of-drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
            <SidebarContent onNavigate={handleNav} />
          </div>
        </>
      ) : null}
    </div>
  );
}
