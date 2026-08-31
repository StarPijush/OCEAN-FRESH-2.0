import { Icon, type IconName } from '../../Icon';

export interface NavItemProps {
  label: string;
  icon: IconName;
  activeIcon: IconName;
  active?: boolean;
  badge?: number;
  onPress: () => void;
}

export function NavItem({ label, icon, activeIcon, active, badge, onPress }: NavItemProps) {
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
        fontFamily: 'var(--font-ui)',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      <Icon
        name={active ? activeIcon : icon}
        size={18}
        color={active ? 'var(--color-aqua)' : 'var(--color-muted2)'}
      />
      <span style={{ flex: 1, color: active ? 'var(--color-cream)' : undefined }}>{label}</span>
      {badge && badge > 0 ? (
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
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  );
}
