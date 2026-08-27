import './Dock.css';

interface DockItemData {
  icon: React.ReactNode;
  label: string;
  visLabel?: string;
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  badge?: number;
}

interface DockProps {
  items: DockItemData[];
  className?: string;
  theme?: 'dark' | 'light';
  // kept for backward compat — ignored (animation removed)
  spring?: unknown;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
}

function DockItem({
  icon,
  visLabel,
  ariaLabel,
  className = '',
  onClick,
  active,
  badge,
}: {
  icon: React.ReactNode;
  visLabel: string;
  ariaLabel: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`dock-item ${active ? 'active' : ''} ${className}`}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="dock-icon-wrap">
        <div className="dock-icon">{icon}</div>
        {typeof badge === 'number' && badge > 0 && (
          <span className="dock-badge" aria-hidden="true">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="dock-static-label" aria-hidden="true">
        {visLabel}
      </span>
    </button>
  );
}

export default function Dock({ items, className = '', theme = 'dark' }: DockProps) {
  return (
    <div className="dock-outer">
      <div
        className={`dock-panel ${theme} ${className}`}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            icon={item.icon}
            visLabel={item.visLabel ?? item.label}
            ariaLabel={item.ariaLabel ?? item.label}
            onClick={item.onClick}
            className={item.className ?? ''}
            active={item.active}
            badge={item.badge}
          />
        ))}
      </div>
    </div>
  );
}

export type { DockItemData };
