import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { IconButton } from './IconButton';

export type SheetPosition = 'bottom' | 'right';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: SheetPosition;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showDragHandle?: boolean;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  showDragHandle = true,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      contentRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
      if (e.key === 'Tab') {
        const focusableElements = contentRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements && focusableElements.length > 0) {
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const isBottom = position === 'bottom';
  const effectivePosition = isMobile ? 'bottom' : position;

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: isBottom ? { height: '35vh', maxHeight: '400px' } : { width: '320px', maxWidth: '40vw' },
    md: isBottom ? { height: '50vh', maxHeight: '600px' } : { width: '400px', maxWidth: '50vw' },
    lg: isBottom ? { height: '70vh', maxHeight: '800px' } : { width: '560px', maxWidth: '60vw' },
    full: isBottom ? { height: '100%', maxHeight: '100%' } : { width: '100%', maxWidth: '100%' },
  };

  const contentAnimation = isBottom
    ? 'slideUp var(--duration-normal) var(--ease-out)'
    : 'slideLeft var(--duration-normal) var(--ease-out)';

  const portal = document.getElementById('sheet-portal') || document.body;

  return createPortal(
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-drawer)',
        display: 'flex',
        alignItems: isBottom ? 'flex-end' : 'center',
        justifyContent: isBottom
          ? 'center'
          : effectivePosition === 'right'
            ? 'flex-end'
            : 'flex-start',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn var(--duration-normal) var(--ease-out)',
      }}
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          width: '100%',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border2)',
          borderRadius: isBottom
            ? 'var(--radius-xl) var(--radius-xl) 0 0'
            : '0 var(--radius-xl) var(--radius-xl) 0',
          boxShadow: 'var(--shadow-drawer)',
          maxHeight: isBottom ? '100%' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: contentAnimation,
          ...sizeStyles[size],
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-md) var(--space-lg)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          {showDragHandle && isBottom && isMobile && (
            <div
              style={{
                width: '36px',
                height: '4px',
                background: 'var(--color-border2)',
                borderRadius: '2px',
                margin: '0 auto',
              }}
              aria-hidden="true"
            />
          )}
          {title && (
            <h3
              id="sheet-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h2-size)',
                lineHeight: 'var(--text-h2-line)',
                fontWeight: 'var(--text-h2-weight)',
                color: 'var(--color-cream)',
                margin: 0,
                flex: 1,
                textAlign: 'center',
              }}
            >
              {title}
            </h3>
          )}
          {showCloseButton && (
            <IconButton variant="default" size="md" aria-label="Close" onClick={onClose}>
              ✕
            </IconButton>
          )}
        </div>
        <div style={{ padding: 'var(--space-lg)', overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>,
    portal,
  );
};
