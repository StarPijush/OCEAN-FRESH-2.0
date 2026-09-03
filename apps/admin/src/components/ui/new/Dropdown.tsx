import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownItem {
  label?: string;
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger:
    | ReactNode
    | ((props: { open: boolean; onToggle: () => void; onClose: () => void }) => ReactNode);
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
  style,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portal = document.getElementById('dropdown-portal') || document.body;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const triggerElement =
    typeof trigger === 'function' ? trigger({ open, onToggle: toggle, onClose: close }) : trigger;

  return (
    <>
      <div ref={triggerRef} className={className} style={{ ...style, display: 'inline-flex' }}>
        {triggerElement}
      </div>
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: triggerRef.current?.getBoundingClientRect().bottom
                ? triggerRef.current.getBoundingClientRect().bottom + window.scrollY + 4
                : 0,
              left:
                align === 'right'
                  ? (triggerRef.current?.getBoundingClientRect().right ?? 0) + window.scrollX - 200
                  : (triggerRef.current?.getBoundingClientRect().left ?? 0) + window.scrollX,
              zIndex: 100,
              minWidth: '200px',
              background: '#FFFFFF',
              border: '1px solid rgba(11,19,15,0.08)',
              borderRadius: 14,
              boxShadow: '0 20px 50px rgba(11,19,15,0.08)',
              overflow: 'hidden',
              padding: 6,
              animation:
                'fadeIn var(--duration-fast) var(--ease-out), slideDown var(--duration-fast) var(--ease-out)',
            }}
            role="menu"
          >
            {items.map((item, index) =>
              item.divider ? (
                <div
                  key={`divider-${index}`}
                  style={{ height: '1px', background: 'rgba(11,19,15,0.06)', margin: '6px 0' }}
                />
              ) : (
                <button
                  key={index}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled || item.divider}
                  onClick={() => {
                    if (!item.disabled && !item.divider && item.onClick) {
                      item.onClick();
                      setOpen(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 10,
                    color: item.danger ? '#EF4444' : '#0B130F',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: item.disabled || item.divider ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.5 : 1,
                    transition: 'background 150ms var(--ease-out)',
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.background = item.danger
                        ? 'rgba(239,68,68,0.08)'
                        : '#F8FAF9';
                      e.currentTarget.style.color = item.danger ? '#EF4444' : '#0B130F';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = item.danger ? '#EF4444' : '#0B130F';
                    }
                  }}
                >
                  {item.icon && <span aria-hidden="true">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ),
            )}
          </div>,
          portal,
        )}
    </>
  );
};
