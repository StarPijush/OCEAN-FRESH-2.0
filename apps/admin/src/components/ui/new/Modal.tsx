import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
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

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { maxWidth: 'var(--modal-max-width-sm)' },
    md: { maxWidth: 'var(--modal-max-width)' },
    lg: { maxWidth: 'var(--modal-max-width-lg)' },
    xl: { maxWidth: '800px' },
  };

  const portal = document.getElementById('modal-portal') || document.body;

  return createPortal(
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-lg)',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn var(--duration-normal) var(--ease-out)',
      }}
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          width: '100%',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border2)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn var(--duration-normal) var(--ease-out)',
          ...sizeStyles[size],
        }}
      >
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-lg)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {title && (
              <h3
                id="modal-title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-h2-size)',
                  lineHeight: 'var(--text-h2-line)',
                  fontWeight: 'var(--text-h2-weight)',
                  color: 'var(--color-cream)',
                  margin: 0,
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
        )}
        <div style={{ padding: 'var(--space-lg)', overflow: 'auto' }}>{children}</div>
      </div>
    </div>,
    portal,
  );
};
