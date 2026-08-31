import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownItem {
  label: string;
  onClick: () => void;
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
              zIndex: 'var(--z-dropdown)',
              minWidth: '200px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border2)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-dropdown)',
              overflow: 'hidden',
              animation:
                'fadeIn var(--duration-fast) var(--ease-out), slideDown var(--duration-fast) var(--ease-out)',
            }}
            role="menu"
          >
            {items.map((item, index) =>
              item.divider ? (
                <div
                  key={`divider-${index}`}
                  style={{ height: '1px', background: 'var(--color-border)', margin: '4px 8px' }}
                />
              ) : (
                <button
                  key={index}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setOpen(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: item.danger ? 'var(--color-warn)' : 'var(--color-cream)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-body-sm-size)',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.5 : 1,
                    transition: 'background 150ms var(--ease-out)',
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!item.disabled) e.currentTarget.style.background = 'transparent';
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
