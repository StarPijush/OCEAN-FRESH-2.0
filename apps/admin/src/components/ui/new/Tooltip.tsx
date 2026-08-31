import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portal = document.getElementById('tooltip-portal') || document.body;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      if (triggerRef.current) {
        setTooltipRect(triggerRef.current.getBoundingClientRect());
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const positionStyles: Record<TooltipPosition, React.CSSProperties> = {
    top: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    bottom: {
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      right: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    right: {
      left: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  };

  const arrowStyles: Record<TooltipPosition, React.CSSProperties> = {
    top: {
      bottom: '-6px',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      borderTopColor: 'var(--color-surface2)',
      borderLeftColor: 'var(--color-surface2)',
    },
    bottom: {
      top: '-6px',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      borderBottomColor: 'var(--color-surface2)',
      borderRightColor: 'var(--color-surface2)',
    },
    left: {
      right: '-6px',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
      borderTopColor: 'var(--color-surface2)',
      borderRightColor: 'var(--color-surface2)',
    },
    right: {
      left: '-6px',
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
      borderBottomColor: 'var(--color-surface2)',
      borderLeftColor: 'var(--color-surface2)',
    },
  };

  if (!visible || !tooltipRect) return null;

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: tooltipRect.top + window.scrollY,
    left: tooltipRect.left + window.scrollX,
    zIndex: 'var(--z-tooltip)',
    pointerEvents: 'none',
    ...style,
  };

  const tooltipContentStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'var(--color-surface2)',
    color: 'var(--color-cream)',
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-body-xs-size)',
    lineHeight: 'var(--text-body-xs-line)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: 'var(--shadow-tooltip)',
    border: '1px solid var(--color-border2)',
    animation: 'fadeIn var(--duration-fast) var(--ease-out)',
    ...positionStyles[position],
  };

  return (
    <>
      <span
        ref={triggerRef}
        className={className}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>
      {createPortal(
        <div ref={tooltipRef} style={tooltipStyle}>
          <div style={tooltipContentStyle}>{content}</div>
          <div
            style={{
              position: 'absolute',
              width: '0',
              height: '0',
              border: '6px solid transparent',
              ...arrowStyles[position],
            }}
            aria-hidden="true"
          />
        </div>,
        portal,
      )}
    </>
  );
};
